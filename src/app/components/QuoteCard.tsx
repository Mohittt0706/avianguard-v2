import { Quote } from 'lucide-react';
import { motion } from 'motion/react';

interface QuoteCardProps {
  text: string;
  author: string;
}

export function QuoteCard({ text, author }: QuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 border-l-4 border-green-500"
    >
      <Quote className="text-green-500 mb-3" size={24} />
      <p className="text-lg italic text-gray-700 mb-2">"{text}"</p>
      <p className="text-sm text-gray-600">— {author}</p>
    </motion.div>
  );
}
