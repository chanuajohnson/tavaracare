import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { EmployerSettings } from "@/types/careTypes";

export interface EmployerSettingsDto {
  id?: string;
  family_id: string;
  trade_name?: string;
  employer_registration_number?: string;
  service_centre_code?: string;
  address?: string;
  phone?: string;
}

const adaptFromDb = (dto: EmployerSettingsDto): EmployerSettings => ({
  id: dto.id!,
  familyId: dto.family_id,
  tradeName: dto.trade_name || undefined,
  employerRegistrationNumber: dto.employer_registration_number || undefined,
  serviceCentreCode: dto.service_centre_code || undefined,
  address: dto.address || undefined,
  phone: dto.phone || undefined,
});

export const fetchEmployerSettings = async (familyId: string): Promise<EmployerSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('employer_settings')
      .select('*')
      .eq('family_id', familyId)
      .maybeSingle();

    if (error) throw error;
    return data ? adaptFromDb(data as EmployerSettingsDto) : null;
  } catch (error) {
    console.error("Error fetching employer settings:", error);
    return null;
  }
};

export const upsertEmployerSettings = async (
  familyId: string,
  settings: Partial<EmployerSettings>
): Promise<boolean> => {
  try {
    const dto: EmployerSettingsDto = {
      family_id: familyId,
      trade_name: settings.tradeName,
      employer_registration_number: settings.employerRegistrationNumber,
      service_centre_code: settings.serviceCentreCode,
      address: settings.address,
      phone: settings.phone,
    };

    const { error } = await supabase
      .from('employer_settings')
      .upsert(dto, { onConflict: 'family_id' });

    if (error) throw error;
    toast.success("Employer settings saved");
    return true;
  } catch (error) {
    console.error("Error saving employer settings:", error);
    toast.error("Failed to save employer settings");
    return false;
  }
};
