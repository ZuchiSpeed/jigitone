type Props = {
  children: React.ReactNode;
};

export const StickyWrapper = ({ children }: Props) => {
  return (
    <div className="hidden lg:block sticky self-end bottom-6 w-[368px]">
      <div className="sticky top-6 flex flex-col gap-y-4 min-h-[calc(100vh-48px)]">
        {children}
      </div>
    </div>
  );
};
