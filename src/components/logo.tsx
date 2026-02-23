import darkLogo from "@/assets/logos/dark.svg";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative">
      <Image
       width={60}
            height={60}
        src={'/images/user/logo.png'}
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        style={{borderRadius:'40px'}}
      />

      <Image
       width={60}
            height={60}
        src={'/images/user/logo.png'}
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        style={{borderRadius:'40px'}}

      />
    </div>
  );
}
