interface PageHeaderProps {
  title: string;
}

const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <h2 className="text-4xl font-bold mt-3 mb-4 text-center text-amber-500">
      <span className="glow-charcoal">{title}</span>
    </h2>
  );
};

export default PageHeader;

