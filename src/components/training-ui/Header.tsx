// Header.tsx'use client';

import { BarChart3, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X } from 'lucide-react';
interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}
export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
        <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-sm">
          <BarChart3 className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-slate-900 text-base font-bold tracking-tight leading-tight">
            Advanced ML Studio
          </h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Training Monitor
          </p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex -space-x-2">
          <Avatar className="w-8 h-8 border-2 border-white ring-1 ring-slate-200">
            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuDO1AELCpTXljVGhoGsbDnEaghXsoJnoAsGPrgqWUQgFfeEQx2GXpSrzPKQRsYd8T4bUbQpJfRQtn1PW_2kQDpAMg0sbVZL5AjV2qP3pIx4GetkL8l3AHC8-xrJiqyeiykEwMyE2YuLNgb4EZG6E4CuVHAtrFVh5S-EPb3QVEZRoE0zQ4dTNvVWSxtqSBPH0a2mmoH45QEaW6eCtxKd9kPZ2vLmtEdG38ElaTiAjYnhmnJVpV4TjMgPL3zEuk-k_uf2V18h5Byinrc" />
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-white ring-1 ring-slate-200">
            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUwr_4Z6wts7yWRxfJmTUHYDnEqKbh-P9SfJLgsOV-5egGIzLKKnGUtgnCV6pKnJ4Bjd9lrHTwzWUqwSongUbC3-OtYQkjbzi1_jcL4QKYnSuO-wqcp5aiaLF-2VjeT7T3omq9_kyi0lUm-9AbUQSRkQLtrw_Yeg0P4HgWCXDvBTYMYOlHTIsmFByME2Wp6NUmjSPa3WWW1u4GL71eI0Xsmd3joI9_qNmNeFHr425HJHa-c8tNgztuqJoDGD0head-RhWBv83XIVU" />
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <Avatar className="w-8 h-8 border-2 border-white ring-1 ring-slate-200">
            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQgd2ZXrWiynxA0qTOtLv8gEdJtjcnp200MW1RJ0AiNliUmdHNNLpemVkULMrC32xr5cMFSl6Jr1iIPJLTrPT_cBzRQeJydqeeYAPtnoZ7yzoTfYCPHQAq-aFIh238IAtJwwg5B2YxAKMRu_Yb2JwVRQscFz670pSNx-fWj8wDOIbxWs-LG9MEnZ5lvHacWmXrJDpaVaMmFyFFiG8czNm21hA8n1ktg-yoPLhluysleJ9YFe9PdyT4p2vzJth4nBoYjbThhO40fvQ" />
            <AvatarFallback>U3</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex gap-2 items-center">
          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <FileText className="w-4 h-4" />
            <span>Auto-Generate PDF Report</span>
          </Button>
          <Avatar className="w-9 h-9 ring-2 ring-blue-600/10 ml-2">
            <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuBSMriZcb76tWFHwd5PBkWrOKXnUcScSA1OmGw0S9HmlhmESDqoc-XhjhSxIz3tdgAdLRU-JlVIVb8i59bZPdBc8Ro96AtwrpHucKeDyNH6kXAy_Q01LctMRq_Y10CBmoFmIu3TDEGRGBsLYFri2C7cZtpbMb9Nu_PTETbzk-bEPY_JB6Rvxe-JgGVVt6bOy9AIwTrR2wqttEf8e5YZ0uzuobThfvDlD0E4llSHU83QJnfa9-y_XF6lN0VMqEff9qTcf9htsLUKd1M" />
            <AvatarFallback>ME</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}