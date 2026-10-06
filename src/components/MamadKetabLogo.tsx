import React from 'react';

interface MamadKetabLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const MamadKetabLogo: React.FC<MamadKetabLogoProps> = ({
  showSubtitle = true
}) => {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-300">
            ممدکتاب
          </span>
        </div>
        {showSubtitle && (
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            مرجع کتاب‌های چاپی، صوتی و الکترونیک
          </p>
        )}
      </div>
    </div>
  );
};

