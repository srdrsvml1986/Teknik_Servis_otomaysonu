-- Audit logs insert/update policy (trigger için gerekli)
DO $$
BEGIN
    DROP POLICY IF EXISTS "System can write audit logs" ON audit_logs;
    CREATE POLICY "System can write audit logs"
      ON audit_logs FOR INSERT
      TO authenticated
      WITH CHECK (true);

    DROP POLICY IF EXISTS "System can update audit logs" ON audit_logs;
    CREATE POLICY "System can update audit logs"
      ON audit_logs FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
END $$;
