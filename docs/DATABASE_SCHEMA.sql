-- AI Sales Email Copilot - Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company_name VARCHAR(255),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- OAuth Connections (Gmail, Outlook)
CREATE TABLE oauth_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('gmail', 'outlook')),
    provider_user_id VARCHAR(255),
    email_address VARCHAR(255) NOT NULL,
    access_token TEXT NOT NULL, -- Encrypted
    refresh_token TEXT, -- Encrypted
    token_expires_at TIMESTAMP,
    scope TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_oauth_connections_user_id ON oauth_connections(user_id);
CREATE INDEX idx_oauth_connections_provider ON oauth_connections(provider);
CREATE INDEX idx_oauth_connections_email ON oauth_connections(email_address);

-- ============================================================================
-- TEAMS & COLLABORATION
-- ============================================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    slug VARCHAR(255) UNIQUE,
    custom_domain VARCHAR(255), -- For white label
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_slug ON teams(slug);

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- ============================================================================
-- TEMPLATES
-- ============================================================================

CREATE TABLE template_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    category_id UUID REFERENCES template_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    body_html TEXT NOT NULL,
    body_text TEXT,
    variables JSONB DEFAULT '[]', -- e.g., ["firstName", "company", "jobTitle"]
    is_public BOOLEAN DEFAULT FALSE,
    is_prebuilt BOOLEAN DEFAULT FALSE,
    usage_count INTEGER DEFAULT 0,
    performance_score DECIMAL(5,2), -- 0-100
    open_rate DECIMAL(5,2),
    reply_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    tags TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR team_id IS NOT NULL OR is_prebuilt = TRUE)
);

CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_team_id ON templates(team_id);
CREATE INDEX idx_templates_category_id ON templates(category_id);
CREATE INDEX idx_templates_is_public ON templates(is_public);
CREATE INDEX idx_templates_is_prebuilt ON templates(is_prebuilt);
CREATE INDEX idx_templates_performance_score ON templates(performance_score DESC);

-- Full-text search on templates
CREATE INDEX idx_templates_search ON templates USING gin(to_tsvector('english', name || ' ' || COALESCE(subject, '')));

-- ============================================================================
-- SEQUENCES
-- ============================================================================

CREATE TABLE sequences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    steps JSONB NOT NULL, -- Array of step objects
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sequences_user_id ON sequences(user_id);
CREATE INDEX idx_sequences_team_id ON sequences(team_id);

CREATE TABLE sequence_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sequence_id UUID NOT NULL REFERENCES sequences(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    delay_days INTEGER DEFAULT 0,
    delay_hours INTEGER DEFAULT 0,
    conditions JSONB DEFAULT '{}', -- e.g., {"if_no_reply": true, "if_opened": false}
    subject_override VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(sequence_id, step_order)
);

CREATE INDEX idx_sequence_steps_sequence_id ON sequence_steps(sequence_id);
CREATE INDEX idx_sequence_steps_template_id ON sequence_steps(template_id);

-- ============================================================================
-- CAMPAIGNS
-- ============================================================================

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    sequence_id UUID REFERENCES sequences(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'archived')),
    total_leads INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    replies_received INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2),
    reply_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX idx_campaigns_team_id ON campaigns(team_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_sequence_id ON campaigns(sequence_id);
CREATE INDEX idx_campaigns_created_at ON campaigns(created_at DESC);

-- ============================================================================
-- LEADS
-- ============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(255),
    phone VARCHAR(50),
    website VARCHAR(255),
    linkedin_url VARCHAR(500),
    custom_fields JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'opened', 'clicked', 'replied', 'bounced', 'unsubscribed', 'completed')),
    current_step INTEGER DEFAULT 0,
    last_email_sent_at TIMESTAMP,
    last_opened_at TIMESTAMP,
    last_clicked_at TIMESTAMP,
    last_replied_at TIMESTAMP,
    reply_content TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, email)
);

CREATE INDEX idx_leads_campaign_id ON leads(campaign_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_company ON leads(company);

-- Lead Research Data
CREATE TABLE lead_research_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    company_domain VARCHAR(255),
    company_size VARCHAR(50),
    industry VARCHAR(100),
    location VARCHAR(255),
    recent_news JSONB DEFAULT '[]',
    tech_stack JSONB DEFAULT '[]',
    linkedin_url VARCHAR(500),
    research_data JSONB DEFAULT '{}', -- Full research object
    icebreakers TEXT[],
    pain_points TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lead_id)
);

CREATE INDEX idx_lead_research_lead_id ON lead_research_data(lead_id);
CREATE INDEX idx_lead_research_domain ON lead_research_data(company_domain);

-- ============================================================================
-- EMAILS (MVP - Lumina Flow)
-- ============================================================================

-- Email Drafts (mutable until sent)
CREATE TABLE email_drafts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    subject TEXT,
    body_html TEXT,
    body_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_drafts_user_id ON email_drafts(user_id);
CREATE INDEX idx_email_drafts_workspace_id ON email_drafts(workspace_id);
CREATE INDEX idx_email_drafts_prospect_id ON email_drafts(prospect_id);
CREATE INDEX idx_email_drafts_updated_at ON email_drafts(updated_at DESC);

-- Prospects (for MVP)
CREATE TABLE prospects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workspace_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    company VARCHAR(255),
    job_title VARCHAR(255),
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prospects_workspace_id ON prospects(workspace_id);
CREATE INDEX idx_prospects_email ON prospects(email);
CREATE INDEX idx_prospects_company ON prospects(company);

-- Company Data (for personalization)
CREATE TABLE company_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    domain VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    industry VARCHAR(100),
    size VARCHAR(50),
    location VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_company_data_domain ON company_data(domain);

-- Emails (immutable after creation)
CREATE TABLE emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draft_id UUID REFERENCES email_drafts(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    prospect_id UUID REFERENCES prospects(id) ON DELETE SET NULL,
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    status VARCHAR(50) DEFAULT 'PENDING_SEND' CHECK (status IN ('PENDING_SEND', 'SENT', 'FAILED', 'BOUNCED')),
    idempotency_key UUID UNIQUE,
    provider_message_id VARCHAR(255),
    tracking_pixel_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emails_draft_id ON emails(draft_id);
CREATE INDEX idx_emails_user_id ON emails(user_id);
CREATE INDEX idx_emails_workspace_id ON emails(workspace_id);
CREATE INDEX idx_emails_prospect_id ON emails(prospect_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_idempotency_key ON emails(idempotency_key);
CREATE INDEX idx_emails_tracking_pixel_id ON emails(tracking_pixel_id);
CREATE INDEX idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX idx_emails_to_email ON emails(to_email);

-- Email Events (append-only log)
CREATE TABLE email_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('opened', 'replied', 'bounced', 'clicked', 'delivered')),
    event_data JSONB DEFAULT '{}',
    provider_event_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_events_email_id ON email_events(email_id);
CREATE INDEX idx_email_events_event_type ON email_events(event_type);
CREATE INDEX idx_email_events_created_at ON email_events(created_at DESC);

-- Email Clicks (Link Tracking)
CREATE TABLE email_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT
);

CREATE INDEX idx_email_clicks_email_id ON email_clicks(email_id);
CREATE INDEX idx_email_clicks_clicked_at ON email_clicks(clicked_at DESC);

-- ============================================================================
-- EMAILS (Legacy - For Future Phases: Campaigns, Sequences)
-- ============================================================================

-- Note: These tables are for future phases (campaigns, sequences)
-- They are kept separate from MVP flow

CREATE TABLE emails_legacy (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    sequence_step_id UUID REFERENCES sequence_steps(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    from_email VARCHAR(255) NOT NULL,
    to_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'sending', 'sent', 'failed', 'bounced')),
    tracking_pixel_id UUID UNIQUE DEFAULT uuid_generate_v4(),
    gmail_message_id VARCHAR(255),
    outlook_message_id VARCHAR(255),
    error_message TEXT,
    sent_at TIMESTAMP,
    delivered_at TIMESTAMP,
    opened_at TIMESTAMP,
    first_opened_at TIMESTAMP,
    opened_count INTEGER DEFAULT 0,
    clicked_at TIMESTAMP,
    clicked_count INTEGER DEFAULT 0,
    replied_at TIMESTAMP,
    bounced_at TIMESTAMP,
    bounce_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_emails_campaign_id ON emails(campaign_id);
CREATE INDEX idx_emails_lead_id ON emails(lead_id);
CREATE INDEX idx_emails_template_id ON emails(template_id);
CREATE INDEX idx_emails_status ON emails(status);
CREATE INDEX idx_emails_tracking_pixel_id ON emails(tracking_pixel_id);
CREATE INDEX idx_emails_sent_at ON emails(sent_at DESC);
CREATE INDEX idx_emails_to_email ON emails(to_email);

-- Email Clicks (Link Tracking)
CREATE TABLE email_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
    link_url TEXT NOT NULL,
    clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT
);

CREATE INDEX idx_email_clicks_email_id ON email_clicks(email_id);
CREATE INDEX idx_email_clicks_clicked_at ON email_clicks(clicked_at DESC);

-- ============================================================================
-- ANALYTICS
-- ============================================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('email_sent', 'email_delivered', 'email_opened', 'email_clicked', 'email_replied', 'email_bounced', 'email_unsubscribed')),
    email_id UUID REFERENCES emails(id) ON DELETE SET NULL,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_email_id ON analytics_events(email_id);
CREATE INDEX idx_analytics_events_campaign_id ON analytics_events(campaign_id);
CREATE INDEX idx_analytics_events_template_id ON analytics_events(template_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- Partition analytics_events by month for better performance
-- CREATE TABLE analytics_events_2024_01 PARTITION OF analytics_events
--     FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Campaign Analytics (Daily Aggregates)
CREATE TABLE campaign_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_clicked INTEGER DEFAULT 0,
    replies_received INTEGER DEFAULT 0,
    bounces INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    open_rate DECIMAL(5,2),
    click_rate DECIMAL(5,2),
    reply_rate DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(campaign_id, date)
);

CREATE INDEX idx_campaign_analytics_campaign_id ON campaign_analytics(campaign_id);
CREATE INDEX idx_campaign_analytics_date ON campaign_analytics(date DESC);

-- ============================================================================
-- A/B TESTS
-- ============================================================================

CREATE TABLE ab_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    variant_a_template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    variant_b_template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
    split_percentage INTEGER DEFAULT 50 CHECK (split_percentage BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'completed', 'paused')),
    variant_a_sent INTEGER DEFAULT 0,
    variant_b_sent INTEGER DEFAULT 0,
    variant_a_opened INTEGER DEFAULT 0,
    variant_b_opened INTEGER DEFAULT 0,
    variant_a_replied INTEGER DEFAULT 0,
    variant_b_replied INTEGER DEFAULT 0,
    winner_template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    confidence_level DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_ab_tests_campaign_id ON ab_tests(campaign_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);

-- ============================================================================
-- INTEGRATIONS
-- ============================================================================

CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    provider VARCHAR(50) NOT NULL CHECK (provider IN ('salesforce', 'hubspot', 'pipedrive', 'calendly', 'cal_com', 'slack', 'zapier')),
    access_token TEXT, -- Encrypted
    refresh_token TEXT, -- Encrypted
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    last_sync_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (user_id IS NOT NULL OR team_id IS NOT NULL)
);

CREATE INDEX idx_integrations_user_id ON integrations(user_id);
CREATE INDEX idx_integrations_team_id ON integrations(team_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);

-- ============================================================================
-- ACTIVITY LOGS (For Teams & Audit)
-- ============================================================================

CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_team_id ON activity_logs(team_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);

-- ============================================================================
-- WEBHOOKS
-- ============================================================================

CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL, -- Array of event types
    secret VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_triggered_at TIMESTAMP,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhooks_team_id ON webhooks(team_id);

CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    response_status INTEGER,
    response_body TEXT,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_deliveries_webhook_id ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_delivered_at ON webhook_deliveries(delivered_at DESC);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oauth_connections_updated_at BEFORE UPDATE ON oauth_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sequences_updated_at BEFORE UPDATE ON sequences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emails_updated_at BEFORE UPDATE ON emails
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update campaign stats
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE campaigns
    SET
        emails_sent = (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent'),
        emails_opened = (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL),
        emails_clicked = (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL),
        replies_received = (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND replied_at IS NOT NULL),
        bounces = (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'bounced'),
        open_rate = CASE 
            WHEN (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent') > 0
            THEN (SELECT COUNT(*)::DECIMAL FROM emails WHERE campaign_id = NEW.campaign_id AND opened_at IS NOT NULL) / 
                 (SELECT COUNT(*)::DECIMAL FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent') * 100
            ELSE 0
        END,
        reply_rate = CASE
            WHEN (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent') > 0
            THEN (SELECT COUNT(*)::DECIMAL FROM emails WHERE campaign_id = NEW.campaign_id AND replied_at IS NOT NULL) /
                 (SELECT COUNT(*)::DECIMAL FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent') * 100
            ELSE 0
        END,
        click_rate = CASE
            WHEN (SELECT COUNT(*) FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent') > 0
            THEN (SELECT COUNT(*)::DECIMAL FROM emails WHERE campaign_id = NEW.campaign_id AND clicked_at IS NOT NULL) /
                 (SELECT COUNT(*)::DECIMAL FROM emails WHERE campaign_id = NEW.campaign_id AND status = 'sent') * 100
            ELSE 0
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.campaign_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update campaign stats when email status changes
CREATE TRIGGER update_campaign_stats_on_email_update
    AFTER INSERT OR UPDATE ON emails
    FOR EACH ROW
    WHEN (NEW.campaign_id IS NOT NULL)
    EXECUTE FUNCTION update_campaign_stats();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default template categories
INSERT INTO template_categories (name, slug, description) VALUES
('Cold Outreach', 'cold-outreach', 'Templates for initial cold email outreach'),
('Follow-up', 'follow-up', 'Follow-up email templates'),
('Demo Request', 'demo-request', 'Templates for requesting product demos'),
('Proposal', 'proposal', 'Proposal and pricing email templates'),
('Thank You', 'thank-you', 'Thank you and appreciation emails'),
('Re-engagement', 're-engagement', 'Re-engaging inactive leads'),
('Introduction', 'introduction', 'Introduction and networking emails'),
('Value Proposition', 'value-proposition', 'Highlighting product value');

-- ============================================================================
-- VIEWS (For Common Queries)
-- ============================================================================

-- Campaign Performance View
CREATE OR REPLACE VIEW campaign_performance AS
SELECT
    c.id,
    c.name,
    c.status,
    c.total_leads,
    c.emails_sent,
    c.emails_opened,
    c.emails_clicked,
    c.replies_received,
    c.open_rate,
    c.click_rate,
    c.reply_rate,
    c.created_at,
    c.started_at,
    c.completed_at
FROM campaigns c;

-- Template Performance View
CREATE OR REPLACE VIEW template_performance AS
SELECT
    t.id,
    t.name,
    t.category_id,
    tc.name AS category_name,
    COUNT(DISTINCT e.id) AS usage_count,
    COUNT(DISTINCT CASE WHEN e.opened_at IS NOT NULL THEN e.id END) AS opens,
    COUNT(DISTINCT CASE WHEN e.clicked_at IS NOT NULL THEN e.id END) AS clicks,
    COUNT(DISTINCT CASE WHEN e.replied_at IS NOT NULL THEN e.id END) AS replies,
    CASE
        WHEN COUNT(DISTINCT e.id) > 0
        THEN (COUNT(DISTINCT CASE WHEN e.opened_at IS NOT NULL THEN e.id END)::DECIMAL / COUNT(DISTINCT e.id)::DECIMAL) * 100
        ELSE 0
    END AS open_rate,
    CASE
        WHEN COUNT(DISTINCT e.id) > 0
        THEN (COUNT(DISTINCT CASE WHEN e.replied_at IS NOT NULL THEN e.id END)::DECIMAL / COUNT(DISTINCT e.id)::DECIMAL) * 100
        ELSE 0
    END AS reply_rate
FROM templates t
LEFT JOIN template_categories tc ON t.category_id = tc.id
LEFT JOIN emails e ON e.template_id = t.id AND e.status = 'sent'
GROUP BY t.id, t.name, t.category_id, tc.name;

