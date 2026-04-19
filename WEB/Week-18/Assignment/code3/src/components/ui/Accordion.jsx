import { useState, useRef } from 'react';
import { cn } from '../../lib/cn';

function AccordionItem({ item, isOpen, onToggle }) {
    const contentRef = useRef(null);

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between py-4 text-left font-medium text-gray-900"
            >
                {item.title}
                <span className={cn('transition-transform duration-200', isOpen && 'rotate-180')}>
                    ▼
                </span>
            </button>

            {/* Animate height using the measured scrollHeight.
          Tailwind can't transition to 'auto' directly, so we read the actual
          pixel height and transition max-height to that value. */}
            <div
                ref={contentRef}
                style={{
                    maxHeight: isOpen ? `${contentRef.current?.scrollHeight ?? 1000}px` : '0px',
                }}
                className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
            >
                <p className="pb-4 text-gray-500 text-sm">{item.content}</p>
            </div>
        </div>
    );
}

export default function Accordion({ items }) {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="bg-white rounded-xl border border-gray-100 px-4">
            {items.map((item, index) => (
                <AccordionItem
                    key={item.title}
                    item={item}
                    isOpen={openIndex === index}
                    onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
            ))}
        </div>
    );
}