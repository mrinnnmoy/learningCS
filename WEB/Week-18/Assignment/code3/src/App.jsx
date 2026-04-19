import { useState, useEffect } from 'react';
import { themes, themeNames } from './themes';
import Button from './components/ui/Button';
import Modal from './components/ui/Modal';
import Accordion from './components/ui/Accordion';
import Skeleton from './components/ui/Skeleton';

const accordionItems = [
  { title: 'What is Tailwind CSS?', content: 'A utility-first CSS framework for building custom designs without leaving your HTML.' },
  { title: 'Can I theme it at runtime?', content: 'Yes — by combining CSS custom properties with the rgb(var(...) / <alpha-value>) pattern, colors can change instantly without rebuilding CSS.' },
  { title: 'Does it work with React?', content: 'Tailwind works with any framework. It pairs especially well with component-based UIs like React.' },
];

export default function App() {
  const [theme, setTheme] = useState('indigo');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-12">

        <header className="text-center">
          <h1 className="text-3xl font-bold text-primary text-shadow-sm">
            Component Library Demo
          </h1>
          <p className="text-gray-500 mt-2">Theme, modal, accordion, and skeleton loading</p>
        </header>

        {/* Theme Switcher */}
        <section className="flex justify-center gap-3">
          {themeNames.map((name) => (
            <button
              key={name}
              onClick={() => setTheme(name)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${theme === name ? 'border-gray-900 scale-110' : 'border-transparent'
                }`}
              style={{ backgroundColor: `rgb(${themes[name].primary})` }}
              aria-label={`Switch to ${themes[name].name} theme`}
            />
          ))}
        </section>

        {/* Button Variants */}
        <section className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          {/* Demonstrates className override via tailwind-merge — bg-red-500
              correctly replaces the default bg-primary instead of both applying */}
          <Button className="bg-red-500 hover:bg-red-600">Danger Override</Button>
        </section>

        {/* Modal */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Modal</h2>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Example Modal">
            <p className="text-gray-600 text-sm mb-4">
              This modal fades and scales in. Click the backdrop, the × button,
              or press Escape to close it.
            </p>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Close</Button>
          </Modal>
        </section>

        {/* Accordion */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Accordion</h2>
          <Accordion items={accordionItems} />
        </section>

        {/* Skeleton → Content */}
        <section className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Loading State</h2>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <p className="text-gray-600 text-sm animate-[fadeIn_0.3s_ease-in-out]">
              Content has loaded! This text faded in after the 1.5 second skeleton placeholder.
            </p>
          )}
        </section>

      </div>
    </div>
  );
}