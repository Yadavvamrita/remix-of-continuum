
CREATE POLICY "users upload own prescription objects"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users read own prescription objects"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "users delete own prescription objects"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'prescriptions' AND (storage.foldername(name))[1] = auth.uid()::text);
