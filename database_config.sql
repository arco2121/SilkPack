CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.webs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), 
    symbol_heart_url TEXT NOT NULL,
    symbol_spade_url TEXT NOT NULL,
    symbol_diamond_url TEXT NOT NULL,
    symbol_club_url TEXT NOT NULL,
    
    font_url TEXT NULL, 
    is_public BOOLEAN NOT NULL DEFAULT FALSE, 
    
    owner_id UUID NOT NULL, 
    CONSTRAINT fk_owner
        FOREIGN KEY (owner_id) 
        REFERENCES public.users (id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS public.saved_webs_users (
    user_id UUID NOT NULL, 
    style_id UUID NOT NULL,
    
    PRIMARY KEY (user_id, style_id), 
    
    CONSTRAINT fk_user 
        FOREIGN KEY (user_id) 
        REFERENCES public.users (id)
        ON DELETE CASCADE,
        
    CONSTRAINT fk_web
        FOREIGN KEY (style_id) 
        REFERENCES public.webs (id)
        ON DELETE CASCADE
);