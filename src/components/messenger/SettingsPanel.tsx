import { useState } from "react";
import Icon from "@/components/ui/icon";

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-6 rounded-full transition-all flex-shrink-0 ${value ? "bg-primary" : "bg-secondary border border-border"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

interface SettingRowProps {
  icon: string;
  label: string;
  description?: string;
  toggle?: boolean;
  value?: boolean;
  onChange?: (v: boolean) => void;
  onClick?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, label, description, toggle, value, onChange, onClick, danger }: SettingRowProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3.5 ${onClick ? "cursor-pointer hover:bg-secondary rounded-xl transition-all" : ""}`}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-destructive/15" : "bg-secondary"}`}>
        <Icon name={icon} size={16} className={danger ? "text-destructive" : "text-muted-foreground"} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {toggle && onChange !== undefined && value !== undefined && (
        <Toggle value={value} onChange={onChange} />
      )}
      {onClick && !toggle && (
        <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
      )}
    </div>
  );
}

interface SettingsPanelProps {
  onLogout: () => void;
}

export default function SettingsPanel({ onLogout }: SettingsPanelProps) {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="px-6 pt-5 pb-4 border-b border-border bg-card/30">
        <h2 className="text-lg font-bold text-foreground">Настройки</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-lg space-y-3">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-2">Уведомления</p>
          <SettingRow icon="Bell" label="Push-уведомления" description="Оповещения о новых сообщениях" toggle value={notifications} onChange={setNotifications} />
          <SettingRow icon="Volume2" label="Звуки" description="Звуки уведомлений и отправки" toggle value={sounds} onChange={setSounds} />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-2">Приватность</p>
          <SettingRow icon="Eye" label="Статус «прочитано»" description="Показывать галочки прочтения" toggle value={readReceipts} onChange={setReadReceipts} />
          <SettingRow icon="Wifi" label="Статус онлайн" description="Показывать когда вы в сети" toggle value={onlineStatus} onChange={setOnlineStatus} />
          <SettingRow icon="Shield" label="Двойная аутентификация" description="Дополнительная защита аккаунта" toggle value={twoFactor} onChange={setTwoFactor} />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-2">Приложение</p>
          <SettingRow icon="Palette" label="Оформление" description="Тёмная тема активна" onClick={() => {}} />
          <SettingRow icon="Globe" label="Язык" description="Русский" onClick={() => {}} />
          <SettingRow icon="HardDrive" label="Хранилище" description="Управление кешем и медиафайлами" onClick={() => {}} />
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-4 pt-3 pb-2">Аккаунт</p>
          <SettingRow icon="Key" label="Изменить пароль" onClick={() => {}} />
          <SettingRow icon="Download" label="Экспорт данных" description="Скачать историю переписки" onClick={() => {}} />
          <SettingRow icon="LogOut" label="Выйти из аккаунта" danger onClick={onLogout} />
        </div>

        <p className="text-center text-xs text-muted-foreground py-2">Messenger v1.0.0</p>
      </div>
    </div>
  );
}