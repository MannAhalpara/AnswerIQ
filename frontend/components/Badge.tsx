interface BadgeProps {
  status: 'Pending' | 'Completed' | '';
}

export default function Badge({ status }: BadgeProps) {
  if (!status) return null;

  const styles = {
    Pending: 'text-amber-700 bg-amber-50 border border-amber-200',
    Completed: 'text-green-700 bg-green-50 border border-green-200',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
