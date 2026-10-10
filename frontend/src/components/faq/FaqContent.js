'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import Icon from '@/components/Icon';
import { SUPPORT_EMAIL, SUPPORT_HOURS } from '@/lib/faqContent';

const EASE = [0.215, 0.61, 0.355, 1];

function FaqItem({ item, isOpen, onToggle, id, reduce }) {
  return (
    <div className={`border-b border-outline-variant/40 transition-colors ${isOpen ? 'bg-surface-container-lowest' : ''}`}>
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={isOpen}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="w-full flex items-center justify-between gap-4 text-left py-5 px-1 md:px-2 cursor-pointer group"
        >
          <span className={`font-headline-sm text-base md:text-lg leading-snug transition-colors ${isOpen ? 'text-primary' : 'text-on-surface group-hover:text-primary'}`}>
            {item.q}
          </span>
          <span
            className={`w-8 h-8 rounded-full border flex items-center justify-center flex-none transition-all duration-300 ${
              isOpen ? 'bg-primary border-primary text-white rotate-45' : 'border-outline-variant/60 text-on-surface-variant group-hover:border-primary group-hover:text-primary'
            }`}
          >
            <Icon name="add" size="sm" />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            initial={reduce ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pb-6 px-1 md:px-2 pr-12 space-y-3">
              <p className="font-body-md text-[15px] text-on-surface-variant leading-relaxed">{item.a}</p>
              {item.link && (
                <Link href={item.link.href} className="group inline-flex items-center gap-1.5 font-label-caps text-[11px] tracking-widest text-primary font-bold">
                  {item.link.label.toUpperCase()}
                  <Icon name="arrow_forward" size="sm" className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqContent({ groups }) {
  const reduce = useReducedMotion();
  const [activeGroup, setActiveGroup] = useState(groups[0]?.id);
  // First question open by default so the page never looks empty
  const [openId, setOpenId] = useState(`${groups[0]?.id}-0`);

  const group = groups.find((g) => g.id === activeGroup) || groups[0];

  return (
    <main className="flex-1 w-full">
      <section className="max-w-container-max mx-auto px-4 sm:px-6 md:px-margin-desktop pt-12 md:pt-20 pb-8 md:pb-12 text-center">
        <motion.span
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="font-label-caps text-[10px] text-primary tracking-[0.25em] inline-flex items-center gap-3 font-bold mb-4"
        >
          <span className="inline-block w-8 h-[2px] bg-primary" />
          FAQS
          <span className="inline-block w-8 h-[2px] bg-primary" />
        </motion.span>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          className="font-display-lg text-[2.25rem] sm:text-5xl text-on-surface font-bold leading-tight"
        >
          Have a <span className="italic font-normal text-primary">Question?</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.16 }}
          className="font-body-lg text-base md:text-lg text-on-surface-variant mt-4"
        >
          Sizing, fabric, styling — answered honestly below.
        </motion.p>
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 md:pb-24">
        {/* Topic tabs */}
        <div role="tablist" aria-label="FAQ topics" className="flex flex-wrap justify-center gap-2 mb-6 md:mb-10">
          {groups.map((g) => {
            const isActive = g.id === group.id;
            return (
              <button
                key={g.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActiveGroup(g.id);
                  setOpenId(`${g.id}-0`);
                }}
                className={`px-4 py-2.5 rounded-full border font-label-caps text-[11px] tracking-widest font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary border-primary text-white'
                    : 'bg-transparent border-outline-variant/60 text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {g.title.toUpperCase()}
              </button>
            );
          })}
        </div>

        <motion.div
          key={group.id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          role="tabpanel"
          className="border-t border-outline-variant/40"
        >
          {group.items.map((item, i) => {
            const id = `${group.id}-${i}`;
            return (
              <FaqItem
                key={id}
                id={id}
                item={item}
                reduce={reduce}
                isOpen={openId === id}
                onToggle={() => setOpenId(openId === id ? null : id)}
              />
            );
          })}
        </motion.div>

        {/* Still need help */}
        <div className="mt-12 md:mt-16 rounded-[3px] bg-surface-container-low border border-outline-variant/30 p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="font-headline-sm text-xl text-on-surface">Still have a question?</p>
            <p className="font-body-md text-sm text-on-surface-variant mt-1">
              Write to us at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary font-semibold underline underline-offset-2">{SUPPORT_EMAIL}</a> · {SUPPORT_HOURS}
            </p>
          </div>
          <Link
            href="/contact"
            className="flex-none px-6 py-3.5 bg-primary text-white font-label-caps text-xs tracking-widest rounded-xl font-bold hover:bg-primary-container transition-colors"
          >
            CONTACT US
          </Link>
        </div>
      </section>
    </main>
  );
}
