import { MedicationWithAdministrations } from "@/services/medicationService";
import { Pill } from "lucide-react";

interface MedicationCardPrintableProps {
  medications: MedicationWithAdministrations[];
  carePlanTitle?: string;
  id: string;
}

export function MedicationCardPrintable({
  medications,
  carePlanTitle,
  id,
}: MedicationCardPrintableProps) {
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const timeStr = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div
      id={id}
      style={{
        display: 'none',
        width: '600px',
        padding: '32px',
        backgroundColor: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #3b82f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: '#3b82f6',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Pill style={{ width: '28px', height: '28px', color: '#ffffff' }} />
          </div>
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937',
              margin: 0 
            }}>
              Medication List
            </h1>
            {carePlanTitle && (
              <p style={{ 
                fontSize: '14px', 
                color: '#6b7280',
                margin: '4px 0 0 0'
              }}>
                {carePlanTitle}
              </p>
            )}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#9ca3af',
            margin: 0
          }}>
            Generated on
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#374151',
            margin: '2px 0 0 0',
            fontWeight: '500'
          }}>
            {dateStr}
          </p>
          <p style={{ 
            fontSize: '12px', 
            color: '#6b7280',
            margin: '2px 0 0 0'
          }}>
            {timeStr}
          </p>
        </div>
      </div>

      {/* Medications */}
      {medications.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px',
          color: '#9ca3af'
        }}>
          No medications recorded
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {medications.map((med, index) => (
            <div
              key={med.id}
              style={{
                padding: '16px',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>💊</span>
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {med.name}
                  </h3>
                </div>
                {med.adherence_rate !== undefined && (
                  <div style={{
                    padding: '4px 12px',
                    backgroundColor: med.adherence_rate >= 80 ? '#dcfce7' : med.adherence_rate >= 50 ? '#fef3c7' : '#fee2e2',
                    color: med.adherence_rate >= 80 ? '#166534' : med.adherence_rate >= 50 ? '#92400e' : '#991b1b',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {med.adherence_rate}% adherence
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '14px'
              }}>
                {med.medication_type && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Type: </span>
                    <span style={{ color: '#374151', fontWeight: '500' }}>{med.medication_type}</span>
                  </div>
                )}
                {med.dosage && (
                  <div>
                    <span style={{ color: '#6b7280' }}>Dosage: </span>
                    <span style={{ color: '#374151', fontWeight: '500' }}>{med.dosage}</span>
                  </div>
                )}
              </div>

              {med.instructions && (
                <div style={{ marginTop: '8px', fontSize: '14px' }}>
                  <span style={{ color: '#6b7280' }}>Instructions: </span>
                  <span style={{ color: '#374151' }}>{med.instructions}</span>
                </div>
              )}

              {med.special_instructions && (
                <div style={{ 
                  marginTop: '8px', 
                  padding: '8px 12px',
                  backgroundColor: '#fef3c7',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#92400e'
                }}>
                  ⚠️ {med.special_instructions}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ 
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <p style={{ 
          fontSize: '12px', 
          color: '#9ca3af',
          margin: 0
        }}>
          {medications.length} medication{medications.length !== 1 ? 's' : ''} total
        </p>
        <p style={{ 
          fontSize: '12px', 
          color: '#3b82f6',
          fontWeight: '500',
          margin: 0
        }}>
          Generated by Tavara.care
        </p>
      </div>
    </div>
  );
}
