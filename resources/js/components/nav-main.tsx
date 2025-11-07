import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    SidebarMenuAction,
} from '@/components/ui/sidebar';
import { resolveUrl } from '@/lib/utils';
import { type NavGroup, type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'sidebar_open_nodes';

function loadOpenSet(): Set<string> {
    if (typeof window === 'undefined') return new Set();
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        const arr = JSON.parse(raw) as string[];
        return new Set(arr);
    } catch {
        return new Set();
    }
}

function saveOpenSet(set: Set<string>): void {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
        // ignore
    }
}

function isItemActive(item: NavItem, currentUrl: string): boolean {
    const base = resolveUrl(item.href);
    if (currentUrl.startsWith(base)) {
        return true;
    }
    return (item.children ?? []).some((child) => isItemActive(child, currentUrl));
}

function ItemNode({ item, currentUrl, level = 0 }: { item: NavItem; currentUrl: string; level?: number }) {
    const active = useMemo(() => isItemActive(item, currentUrl), [item, currentUrl]);
    const hasChildren = (item.children && item.children.length > 0) || false;
    const [open, setOpen] = useState<boolean>(active);
    const toggle = useCallback(() => setOpen((v) => !v), []);
    const nodeId = useMemo(() => `node:${item.href ?? item.title}`, [item.href, item.title]);

    // On mount, restore persisted open state (or ensure open if active)
    useEffect(() => {
        if (!hasChildren) return;
        const saved = loadOpenSet();
        if (saved.has(nodeId) || active) {
            setOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nodeId, hasChildren, active]);

    // Persist whenever open changes
    useEffect(() => {
        if (!hasChildren) return;
        const saved = loadOpenSet();
        if (open) {
            saved.add(nodeId);
        } else {
            saved.delete(nodeId);
        }
        saveOpenSet(saved);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, nodeId, hasChildren]);

    if (!hasChildren) {
        return (
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={active} tooltip={{ children: item.title }}>
                    <Link href={item.href} prefetch>
                        {item.icon && <item.icon />}
                        <span>{item.title}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        );
    }

    return (
        <SidebarMenuItem>
            <Collapsible open={open} onOpenChange={setOpen}>
                <SidebarMenuButton
                    isActive={active}
                    onClick={toggle}
                    aria-expanded={open}
                    role="button"
                    tooltip={{ children: item.title }}
                >
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                </SidebarMenuButton>
                <CollapsibleTrigger asChild>
                    <SidebarMenuAction aria-label={open ? 'Collapse' : 'Expand'} title={open ? 'Collapse' : 'Expand'}>
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </SidebarMenuAction>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                        {(item.children ?? []).map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                                <SidebarMenuSubButton asChild isActive={isItemActive(child, currentUrl)}>
                                    <Link href={child.href} prefetch>
                                        {child.icon && <child.icon />}
                                        <span>{child.title}</span>
                                    </Link>
                                </SidebarMenuSubButton>
                                {/* Optional third level */}
                                {child.children && child.children.length > 0 && (
                                    <SidebarMenuSub>
                                        {child.children.map((grand) => (
                                            <SidebarMenuSubItem key={grand.title}>
                                                <SidebarMenuSubButton asChild isActive={isItemActive(grand, currentUrl)} size="sm">
                                                    <Link href={grand.href} prefetch>
                                                        {grand.icon && <grand.icon />}
                                                        <span>{grand.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    );
}

export function NavMain({ groups = [] }: { groups: NavGroup[] }) {
    const page = usePage();
    const currentUrl = page.url;

    return (
        <>
            {groups.map((group) => (
                <SidebarGroup className="px-2 py-0" key={group.title}>
                    <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {group.items.map((item) => (
                                <ItemNode key={item.title} item={item} currentUrl={currentUrl} />
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            ))}
        </>
    );
}
