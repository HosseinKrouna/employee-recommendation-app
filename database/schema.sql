
DROP TABLE IF EXISTS referrals;

CREATE TABLE referrals (
    
    id SERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL DEFAULT 'Eingegangen',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id),

 
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(100),
    contact_source TEXT,
    first_contact_date DATE,
    convinced_date DATE,

  
    informed_about_position BOOLEAN NOT NULL DEFAULT false,
    informed_about_tasks BOOLEAN NOT NULL DEFAULT false,
    informed_about_requirements BOOLEAN NOT NULL DEFAULT false,
    informed_about_customers BOOLEAN NOT NULL DEFAULT false,
    informed_about_benefits BOOLEAN NOT NULL DEFAULT false,
    informed_about_training BOOLEAN NOT NULL DEFAULT false,
    informed_about_career_coach BOOLEAN NOT NULL DEFAULT false,
    informed_about_roles BOOLEAN NOT NULL DEFAULT false,

  
    preferred_position VARCHAR(255),
    employment_status VARCHAR(100),
    current_position VARCHAR(255),
    career_level VARCHAR(100),
    years_of_experience INTEGER,
    notice_period VARCHAR(255),
    start_date DATE,
    salary_expectation VARCHAR(255),
    hours_per_week VARCHAR(100),
    travel_readiness INTEGER, 

    
    skills JSONB,

    
    personality_type VARCHAR(255),
    hobbies TEXT,
    project_experience TEXT,
    misc_notes TEXT,

    
    cv_path VARCHAR(255) 
);