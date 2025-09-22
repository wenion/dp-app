import Image from "next/image";

export default function Home() {
  return (
    <div className="font-sans items-center justify-items-center pt-8">
      <div className="bg-white rounded-lg pt-56 shadow-lg w-4/5 h-[800px] border-l-4 border-primaryLight items-center  justify-center justify-items-center">
        <p className="text-7xl"><b>Reserve Zone</b></p>
      </div>
      <footer className="row-start-3 flex gap-[24px] pt-8 flex-wrap items-center justify-center">
        All rights reserved @2025
      </footer>
    </div>
  );
}
