'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Bell, Shield, Save } from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({ email: true, score: true, jobs: true, interview: false });
  const [privacy, setPrivacy]             = useState({ public: false, analytics: true });

  return (
    <div className="space-y-6 pb-12 max-w-2xl">
      <h2 className="text-3xl font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest">Settings</h2>

      {[
        {
          icon: Bell, title: 'Notifications',
          items: [
            { key:'email',     label:'Email digests',          desc:'Weekly performance summary', val: notifications.email,     set: (v:boolean) => setNotifications(n=>({...n,email:v})) },
            { key:'score',     label:'Score updates',          desc:'When readiness score changes', val: notifications.score,     set: (v:boolean) => setNotifications(n=>({...n,score:v})) },
            { key:'jobs',      label:'New job matches',        desc:'When new recommended jobs appear', val: notifications.jobs,  set: (v:boolean) => setNotifications(n=>({...n,jobs:v})) },
            { key:'interview', label:'Interview reminders',    desc:'Reminder to practice weekly', val: notifications.interview, set: (v:boolean) => setNotifications(n=>({...n,interview:v})) },
          ],
        },
        {
          icon: Shield, title: 'Privacy',
          items: [
            { key:'public',    label:'Public profile',         desc:'Allow faculty to view your profile', val: privacy.public,    set: (v:boolean) => setPrivacy(p=>({...p,public:v})) },
            { key:'analytics', label:'Share analytics data',   desc:'Improve CIP with anonymized data',   val: privacy.analytics, set: (v:boolean) => setPrivacy(p=>({...p,analytics:v})) },
          ],
        },
      ].map(section => (
        <div key={section.title} className="rounded-[32px] border overflow-hidden backdrop-blur-[20px] bg-white dark:bg-[rgba(8,12,20,0.7)] border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2 px-6 py-5 border-b border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            <section.icon size={16} className="text-sky" />
            <h3 className="font-syne font-black text-slate-900 dark:text-white uppercase tracking-widest text-sm">{section.title}</h3>
          </div>
          <div className="divide-y border-slate-200 dark:border-[rgba(255,255,255,0.06)]">
            {section.items.map(item => (
              <div key={item.key} className="flex items-center justify-between px-6 py-5 transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</p>
                  <p className="text-xs font-medium text-slate-400">{item.desc}</p>
                </div>
                <button onClick={() => item.set(!item.val)}
                  className="relative w-11 h-6 rounded-full transition-all flex-shrink-0"
                  style={{ background: item.val ? 'linear-gradient(135deg, #38BDF8, #0EA5E9)' : 'rgba(255,255,255,0.1)' }}>
                  <div className="absolute w-5 h-5 rounded-full bg-white top-0.5 transition-all shadow-sm"
                    style={{ left: item.val ? '22px' : '2px', boxShadow: item.val ? '0 0 10px rgba(56,189,248,0.5)' : 'none' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button onClick={() => toast.success('Settings saved!')}
        className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] hover:-translate-y-1"
        style={{ background: 'linear-gradient(135deg, #38BDF8, #0EA5E9)', color: '#fff' }}>
        <Save size={16} /> Save Settings
      </button>
    </div>
  );
}
