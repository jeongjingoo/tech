import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: string | number;
  link: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function StatsCard({ title, value, link, icon: Icon }: StatsCardProps) {
  //const isPositive = change > 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href={link}>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
          </Link>
        </div>
        <div className="p-3 bg-indigo-50 rounded-full">
          <Icon className="h-6 w-6 text-indigo-600" />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center">
          {/* <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{change}%
          </span> */}
          <span className="ml-2 text-sm text-gray-500">지난달 대비</span>
        </div>
      </div>
    </div>
  );
} 