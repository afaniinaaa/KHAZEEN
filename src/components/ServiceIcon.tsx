import React from "react";
import {
  ShieldCheck,
  Stamp,
  Wallet,
  Fingerprint,
  Car,
  FileCheck2,
  Landmark,
  Briefcase,
  GraduationCap,
  ClipboardCheck,
  BookOpenCheck,
  ShoppingBag,
  Mail,
  FileUser,
  Sun,
  Sprout,
} from "lucide-react";

interface ServiceIconProps {
  iconKey: string;
  accentHex: string;
  size?: "sm" | "md" | "lg";
}

export default function ServiceIcon({ iconKey, accentHex, size = "md" }: ServiceIconProps) {
  const boxClass =
    size === "sm"
      ? "h-10 w-10 rounded-lg"
      : size === "lg"
        ? "h-14 w-14 rounded-xl"
        : "h-12 w-12 rounded-xl";

  const iconClass = size === "sm" ? "h-5 w-5" : size === "lg" ? "h-7 w-7" : "h-6 w-6";

  const renderIcon = () => {
    switch (iconKey) {
      case "absher":
        return <ShieldCheck className={iconClass} />;
      case "jawazat":
        return <Stamp className={iconClass} />;
      case "citizen-account":
        return <Wallet className={iconClass} />;
      case "civil-affairs":
        return <Fingerprint className={iconClass} />;
      case "car-insurance":
        return <Car className={iconClass} />;
      case "istimara-renewal":
        return <FileCheck2 className={iconClass} />;
      case "bank-account":
        return <Landmark className={iconClass} />;
      case "job-application":
        return <Briefcase className={iconClass} />;
      case "university-admission":
        return <GraduationCap className={iconClass} />;
      case "qiyas":
        return <ClipboardCheck className={iconClass} />;
      case "homework-help":
        return <BookOpenCheck className={iconClass} />;
      case "online-shopping":
        return <ShoppingBag className={iconClass} />;
      case "email-creation":
        return <Mail className={iconClass} />;
      case "cv-creation":
        return <FileUser className={iconClass} />;
      case "social-security":
        return <Sun className={iconClass} />;
      case "hafiz-reef-tamheer":
        return <Sprout className={iconClass} />;
      default:
        return <ShieldCheck className={iconClass} />;
    }
  };

  return (
    <div
      className={`${boxClass} flex items-center justify-center shrink-0 border border-stone-200/80`}
      style={{
        backgroundColor: `${accentHex}12`,
        color: accentHex,
      }}
      aria-hidden="true"
    >
      {renderIcon()}
    </div>
  );
}
