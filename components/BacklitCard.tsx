'use client';

import { ReactNode } from 'react';

interface BacklitCardProps {
    children: ReactNode;
    /**
     * Color of the glow effect (default: amber)
     * Examples: 'amber', 'blue', 'purple', 'emerald'
     */
    glowColor?: 'amber' | 'blue' | 'purple' | 'emerald' | 'rose';
    /**
     * Intensity of the glow (default: 'subtle')
     */
    intensity?: 'subtle' | 'medium' | 'strong';
    /**
     * Border radius for the glow effect (default: '1.5rem' for rounded-2xl)
     * Examples: '0.5rem', '1rem', '1.5rem', '9999px' (for full rounded)
     */
    borderRadius?: string;
    className?: string;
}

const glowColors = {
    amber: {
        outer: 'rgba(255, 200, 120, 0.35)',
        outerSecondary: 'rgba(255, 160, 60, 0.15)',
        inner: 'rgba(255, 190, 100, 0.20)',
        innerSecondary: 'rgba(255, 170, 80, 0.10)',
    },
    blue: {
        outer: 'rgba(120, 180, 255, 0.35)',
        outerSecondary: 'rgba(60, 140, 255, 0.15)',
        inner: 'rgba(100, 170, 255, 0.20)',
        innerSecondary: 'rgba(80, 150, 255, 0.10)',
    },
    purple: {
        outer: 'rgba(200, 120, 255, 0.35)',
        outerSecondary: 'rgba(160, 60, 255, 0.15)',
        inner: 'rgba(190, 100, 255, 0.20)',
        innerSecondary: 'rgba(170, 80, 255, 0.10)',
    },
    emerald: {
        outer: 'rgba(120, 255, 180, 0.35)',
        outerSecondary: 'rgba(60, 255, 140, 0.15)',
        inner: 'rgba(100, 255, 170, 0.20)',
        innerSecondary: 'rgba(80, 255, 150, 0.10)',
    },
    rose: {
        outer: 'rgba(255, 120, 160, 0.35)',
        outerSecondary: 'rgba(255, 60, 120, 0.15)',
        inner: 'rgba(255, 100, 150, 0.20)',
        innerSecondary: 'rgba(255, 80, 140, 0.10)',
    },
};

const intensityConfig = {
    subtle: {
        blur: 40,
        spread: 130,
        opacity: 0.30,
        innerOpacity: 0.12,
    },
    medium: {
        blur: 45,
        spread: 145,
        opacity: 0.50,
        innerOpacity: 0.18,
    },
    strong: {
        blur: 50,
        spread: 160,
        opacity: 0.70,
        innerOpacity: 0.25,
    },
};

export default function BacklitCard({
    children,
    glowColor = 'amber',
    intensity = 'subtle',
    borderRadius = '1.5rem',
    className = '',
}: BacklitCardProps) {
    const colors = glowColors[glowColor];
    const config = intensityConfig[intensity];

    // Convert rem to px for calculation (assuming 1rem = 16px)
    const parseRadius = (radius: string): number => {
        if (radius.endsWith('rem')) {
            return parseFloat(radius) * 16;
        } else if (radius.endsWith('px')) {
            return parseFloat(radius);
        }
        return 24; // default fallback
    };

    const radiusPx = parseRadius(borderRadius);
    const scaledRadiusPx = (radiusPx * config.spread / 100) + config.blur;

    const wrapperId = `backlit-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`group relative ${className}`} style={{ isolation: 'isolate' }} data-backlit={wrapperId}>
            {/* Outer glow - only visible on hover, with smooth fade on/off */}
            <div
                className="backlit-glow-outer absolute pointer-events-none transition-opacity duration-700 ease-in-out"
                style={{
                    transform: 'translate(-50%, -50%)',
                    top: '50%',
                    left: '50%',
                    width: `${config.spread}%`,
                    height: `${config.spread}%`,
                    background: `radial-gradient(circle at center, ${colors.outer}, ${colors.outerSecondary} 70%, transparent 100%)`,
                    filter: `blur(${config.blur}px)`,
                    borderRadius: `${scaledRadiusPx}px`,
                    zIndex: -1,
                    opacity: 0,
                }}
            />

            {/* Inner glow - subtle edge lighting on hover */}
            <div
                className="backlit-glow-inner absolute inset-0 rounded-[inherit] transition-opacity duration-700 ease-in-out pointer-events-none"
                style={{
                    boxShadow: `inset 0 0 30px ${colors.inner}, inset 0 0 15px ${colors.innerSecondary}`,
                    zIndex: 1,
                    opacity: 0,
                }}
            />

            {/* Card content */}
            <div className="relative" style={{ zIndex: 2 }}>{children}</div>

            {/* CSS animation for subtle flicker - only plays when hovering */}
            <style jsx>{`
                @keyframes subtleFlicker-${wrapperId} {
                    0%,
                    100% {
                        filter: blur(${config.blur}px) brightness(1.0);
                    }
                    50% {
                        filter: blur(${config.blur + 2}px) brightness(1.12);
                    }
                    70% {
                        filter: blur(${config.blur + 1}px) brightness(1.06);
                    }
                }

                [data-backlit="${wrapperId}"]:hover .backlit-glow-outer {
                    opacity: ${config.opacity} !important;
                    animation: subtleFlicker-${wrapperId} 3.5s infinite ease-in-out;
                }

                [data-backlit="${wrapperId}"]:hover .backlit-glow-inner {
                    opacity: ${config.innerOpacity} !important;
                }
            `}</style>
        </div>
    );
}