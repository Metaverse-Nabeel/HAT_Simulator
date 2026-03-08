import Link from "next/link";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">H</span>
      </div>
      <span className="font-bold text-lg text-navy-900">HAT Simulator</span>
    </Link>
  );
}

export function LogoWhite({ className }: { className?: string }) {
  return (
    <Link href="/dashboard" className={`flex items-center gap-2 ${className ?? ""}`}>
      <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-sm">H</span>
      </div>
      <span className="font-bold text-lg text-white">HAT Simulator</span>
    </Link>
  );
}
