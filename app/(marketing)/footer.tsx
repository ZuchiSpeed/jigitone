import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-between h-full gap-x-2">
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <Image
            src="/hr.svg"
            height={24}
            width={32}
            className="rounded-md"
            alt="Croatia"
          />
          <span>Croatian</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <Image
            src="/it.svg"
            height={24}
            width={32}
            className="rounded-md"
            alt="Italian"
          />
          <span>Italian</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <Image
            src="/jp.svg"
            height={24}
            width={32}
            className="rounded-md"
            alt="Japanese"
          />
          <span>Japanese</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <Image
            src="/fr.svg"
            height={24}
            width={32}
            className="rounded-md"
            alt="French"
          />
          <span>French</span>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center space-x-2"
        >
          <Image
            src="/es.svg"
            height={24}
            width={32}
            className="rounded-md"
            alt="Spanish"
          />
          <span>Spanish</span>
        </Button>
      </div>
    </footer>
  );
};
