REVOKE ALL ON FUNCTION public.has_pro_access(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_pro_access(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_pro_access(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_pro_access(uuid) TO service_role;