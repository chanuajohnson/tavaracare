-- 1. Delete 20 duplicate Angela payroll entries at $35 rate (keep first 5)
DELETE FROM payroll_entries WHERE id IN (
  'aa26a87d-0b5c-4630-874a-b3a0fcd24b0e',
  '2c78f593-a96d-429f-960f-20b2f0de82c6',
  'ee7d51fb-8a2c-4cb5-bdcc-07cccf8b94d6',
  'a9688377-6e6d-4aaa-b5db-7a1c0d73b1ef',
  'fd4e260a-1e05-430d-a27a-51d7fe9c1779',
  '5fddaff2-ba7f-480d-ada8-6ca80d6a60c6',
  '250ede76-80b8-4211-9b15-2c76963e8f0d',
  'ef6cede2-f86d-4ab1-aba8-ac0efb9d814e',
  '5016e823-6803-488c-8869-6d1385872cba',
  '7ffa8283-d06c-4922-a920-98f2acc22a79',
  '79e09342-52b7-4c64-82df-c5643ea24a91',
  '48812702-1b2e-446b-b0de-6c2f86d25f39',
  'd661eba2-5076-4897-852f-26c10c00a00e',
  '187cd844-ba7b-4007-86a2-023345d8fbc0',
  'b6f3164b-e607-45ed-ae89-167b712bd259',
  '966986f1-013e-4cad-8c57-0f5aef49a802',
  '1322bfe2-7345-48e4-ab75-c5f6b90d5bb3',
  '3c461675-2438-430b-9af3-e3fdaf71cdf1',
  '9988926a-c340-4d44-9e6d-842e837865ca',
  '67cf754a-4764-412e-aa2f-e2f819e38bb7'
);

-- 2. Delete old Angela entry at incorrect $30 rate
DELETE FROM payroll_entries WHERE id = 'ed72f328-d554-415e-b53a-95f3aae96194';

-- 3. Ensure admins can read all care_plans (if policy doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'care_plans' 
    AND policyname = 'Admins can view all care plans'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can view all care plans" ON public.care_plans FOR SELECT TO authenticated USING (public.is_current_user_admin())';
  END IF;
END $$;