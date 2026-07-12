-- 006: external-URL repository items (official legal texts) + seed
ALTER TABLE repository_items ADD COLUMN external_url TEXT;
INSERT INTO repository_items (item_id, title, description, file_key, mime_type, published, access_level, external_url)
VALUES ('c4d9dafa-62e9-44f9-9c0d-a612965e5755', 'CMR Convention (1956)', 'The UN convention governing the contract for international carriage of goods by road: consignment note requirements, carrier liability and claim periods. Official English text (UNECE).', '', 'application/pdf', 1, 'public', 'https://unece.org/fileadmin/DAM/trans/conventn/cmr_e.pdf');
INSERT INTO repository_items (item_id, title, description, file_key, mime_type, published, access_level, external_url)
VALUES ('6675c57c-0d4d-4c90-9d7d-b659e482dc43', 'Additional Protocol e-CMR (2008)', 'The protocol that gives the electronic consignment note the same legal standing as the paper CMR. Official text (UNECE).', '', 'application/pdf', 1, 'public', 'https://unece.org/fileadmin/DAM/trans/conventn/e-CMRe.pdf');
INSERT INTO repository_items (item_id, title, description, file_key, mime_type, published, access_level, external_url)
VALUES ('aabf8080-d89d-47f0-9d07-30a0107f4f1e', 'CIM — Appendix B to COTIF', 'Uniform rules for the contract of international carriage of goods by rail. Official text (OTIF).', '', 'application/pdf', 1, 'public', 'https://otif.org/fileadmin/new/3-Reference-Text/3A-COTIF99/05_Appendix_B.pdf');
INSERT INTO repository_items (item_id, title, description, file_key, mime_type, published, access_level, external_url)
VALUES ('5d3b0edf-575e-4623-8460-3451fc69fb00', 'CMNI Budapest Convention (2001)', 'The convention on the contract for carriage of goods by inland waterway. Official text (CCNR).', '', 'application/pdf', 1, 'public', 'https://ccr-zkr.org/files/conventions/cmni_en.pdf');
INSERT INTO repository_items (item_id, title, description, file_key, mime_type, published, access_level, external_url)
VALUES ('e6256811-5441-42b2-a8c1-389583f8e7bd', 'TIR Convention (1975) — Handbook 2024', 'The customs transit system for international road transport. TIR Handbook, 2024 edition. Official text (UNECE).', '', 'application/pdf', 1, 'public', 'https://unece.org/sites/default/files/2025-01/TIR-6Rev12e_0.pdf');
INSERT INTO repository_items (item_id, title, description, file_key, mime_type, published, access_level, external_url)
VALUES ('07f00805-0129-4d62-b5fa-426626f3d7c9', 'eFTI Regulation (EU) 2020/1056', 'The EU regulation on electronic freight transport information: the legal basis for authorities to accept digital transport data. Official text (EUR-Lex).', '', 'application/pdf', 1, 'public', 'https://eur-lex.europa.eu/eli/reg/2020/1056/oj');
