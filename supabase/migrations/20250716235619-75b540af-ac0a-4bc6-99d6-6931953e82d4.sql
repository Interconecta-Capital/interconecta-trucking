-- Create some sample remolques in the database
INSERT INTO public.remolques (placa, subtipo_rem) VALUES 
('REM-001', 'CTU01'), -- Caja seca
('REM-002', 'CTU02'), -- Refrigerado  
('REM-003', 'CTU03') -- Tanque
ON CONFLICT (id) DO NOTHING;