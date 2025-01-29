import { APP_NAME } from "@/lib/constants";

import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";

const Header = () => {
  return (
    <>
      <header className="w-full border-b">
        <div className="wrapper flex-between">
          <div className="flex-start">
            <Link href="/" className="flex-start">
              <Image
                alt={`${APP_NAME} logo`}
                src="/images/logo.svg"
                width={48}
                height={48}
                priority
              />
              <span className="hidden lg:block font-bold text-2xl ml-3">
                {APP_NAME}
              </span>
            </Link>
          </div>

          <Menu />
        </div>
      </header>
    </>
  );
};

export default Header;
