/**
 * Performance Monitoring Utilities
 * Track and optimize application performance
 */

import { Request, Response, NextFunction } from "express";

interface PerformanceMetrics {
    endpoint: string;
    method: string;
    duration: number;
    statusCode: number;
    timestamp: Date;
    memoryUsage: NodeJS.MemoryUsage;
}

const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 requests

// Typed cache storage for API responses
const apiCacheStorage: Record<string, unknown> = {};

/**
 * Performance monitoring middleware
 */
export function performanceMonitor(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    // Capture response
    res.on("finish", () => {
        const duration = Date.now() - startTime;
        const endMemory = process.memoryUsage();

        const metric: PerformanceMetrics = {
            endpoint: req.path,
            method: req.method,
            duration,
            statusCode: res.statusCode,
            timestamp: new Date(),
            memoryUsage: {
                rss: endMemory.rss - startMemory.rss,
                heapTotal: endMemory.heapTotal - startMemory.heapTotal,
                heapUsed: endMemory.heapUsed - startMemory.heapUsed,
                external: endMemory.external - startMemory.external,
                arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers,
            },
        };

        // Store metric
        performanceMetrics.push(metric);
        if (performanceMetrics.length > MAX_METRICS) {
            performanceMetrics.shift();
        }

        // Log slow requests (>1s)
        if (duration > 1000) {
            console.warn(`[PERFORMANCE] Slow request: ${req.method} ${req.path} took ${duration}ms`);
        }
    });

    next();
}

/**
 * Get performance statistics
 */
export function getPerformanceStats() {
    if (performanceMetrics.length === 0) {
        return null;
    }

    const durations = performanceMetrics.map(m => m.duration);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const maxDuration = Math.max(...durations);
    const minDuration = Math.min(...durations);

    // Group by endpoint
    const endpointStats = performanceMetrics.reduce((acc, metric) => {
        const key = `${metric.method} ${metric.endpoint}`;
        if (!acc[key]) {
            acc[key] = {
                count: 0,
                totalDuration: 0,
                avgDuration: 0,
                maxDuration: 0,
            };
        }
        acc[key].count++;
        acc[key].totalDuration += metric.duration;
        acc[key].avgDuration = acc[key].totalDuration / acc[key].count;
        acc[key].maxDuration = Math.max(acc[key].maxDuration, metric.duration);
        return acc;
    }, {} as Record<string, { count: number; totalDuration: number; avgDuration: number; maxDuration: number }>);

    return {
        overall: {
            totalRequests: performanceMetrics.length,
            avgDuration: Math.round(avgDuration),
            maxDuration,
            minDuration,
        },
        endpoints: endpointStats,
        recentMetrics: performanceMetrics.slice(-10),
    };
}

/**
 * Image optimization helper
 */
export function getOptimizedImageUrl(url: string, _width?: number, _quality?: number): string {
    // In production, integrate with CDN image optimization
    // For now, return original URL
    // Example with Cloudinary: `https://res.cloudinary.com/demo/image/upload/w_${_width},q_${_quality}/${url}`
    return url;
}

/**
 * Cache control headers
 */
export function setCacheHeaders(res: Response, maxAge: number) {
    res.setHeader("Cache-Control", `public, max-age=${maxAge}`);
    res.setHeader("Expires", new Date(Date.now() + maxAge * 1000).toUTCString());
}

/**
 * Static asset caching middleware
 */
export function staticAssetCache(req: Request, res: Response, next: NextFunction) {
    // Cache static assets for 1 year
    if (req.path.match(/\.(jpg|jpeg|png|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/)) {
        setCacheHeaders(res, 31536000); // 1 year
    }
    next();
}

/**
 * API response caching middleware
 */
export function apiCache(duration: number) {
    return (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== "GET") {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedResponse = apiCacheStorage[key];

        if (cachedResponse) {
            res.json(cachedResponse);
            return;
        }

        // Override res.json to cache the response
        const originalJson = res.json.bind(res);
        res.json = function (body: unknown) {
            apiCacheStorage[key] = body;
            // Clear cache after duration
            setTimeout(() => {
                delete apiCacheStorage[key];
            }, duration);
            return originalJson(body);
        };

        next();
    };
}

/**
 * Database query optimization helper
 */
export function logSlowQuery(query: string, duration: number) {
    if (duration > 100) { // Log queries slower than 100ms
        console.warn(`[DB PERFORMANCE] Slow query (${duration}ms): ${query}`);
    }
}

/**
 * Memory usage monitoring
 */
export function checkMemoryUsage() {
    const usage = process.memoryUsage();
    const formatMemory = (bytes: number) => `${Math.round(bytes / 1024 / 1024)}MB`;

    return {
        rss: formatMemory(usage.rss),
        heapTotal: formatMemory(usage.heapTotal),
        heapUsed: formatMemory(usage.heapUsed),
        external: formatMemory(usage.external),
    };
}

/**
 * Health check endpoint data
 */
export function getHealthStatus() {
    const uptime = process.uptime();
    const memory = checkMemoryUsage();

    return {
        status: "healthy",
        uptime: `${Math.floor(uptime / 60)} minutes`,
        memory,
        timestamp: new Date().toISOString(),
    };
}
