import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import { ShieldAlert, Users, ChevronRight, Check, X } from 'lucide-react';
import { Modal } from './Modal';

export const DemoBanner: React.FC = () => {
  const { user, switchUser, allDemoProfiles } = useAuth();
  const { t } = useI18n();
  const [modalOpen, setModalOpen] = useState(false);

  const activePersonaName = user ? user.full_name.split(' ')[0] : 'Learner';
  const roleLabel =
    user?.role === 'admin'
      ? 'Admin'
      : user?.role === 'school_admin'
      ? 'School'
      : 'Learner';

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/20 px-3 py-2 text-xs text-amber-950 dark:text-amber-200 flex items-center justify-center gap-1.5 hover:bg-amber-500/20 transition cursor-pointer select-none min-h-[44px]"
      >
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
        <span className="font-semibold truncate">
          Demo Mode: Vadodara test data • Tap to switch persona ({activePersonaName} — {roleLabel})
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
      </button>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Switch Demo Persona"
          subtitle="Experience icandrive as a Learner, School Partner, or Super Admin"
        >
          <div className="space-y-2 pt-1">
            {allDemoProfiles.map((p) => {
              const isSelected = user?.id === p.id;
              const badge =
                p.role === 'admin'
                  ? 'Super Admin'
                  : p.role === 'school_admin'
                  ? 'Driving School'
                  : 'Learner';

              return (
                <button
                  key={p.id}
                  onClick={async () => {
                    await switchUser(p.id);
                    setModalOpen(false);
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center justify-between gap-3 min-h-[52px] cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-600 ring-2 ring-blue-500/20'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  <div className="space-y-0.5 truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        {p.full_name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          p.role === 'admin'
                            ? 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                            : p.role === 'school_admin'
                            ? 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                            : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {badge}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      +91 {p.phone} • {p.language_pref.toUpperCase()}
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
                      Switch →
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
};
