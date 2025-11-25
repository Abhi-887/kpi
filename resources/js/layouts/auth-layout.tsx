import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

export default function AuthLayout({
    children,
    title,
    description,
    accentColor,
    logoText,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
    accentColor?: string;
    logoText?: string;
}) {
    return (
        <AuthLayoutTemplate 
            title={title} 
            description={description} 
            accentColor={accentColor}
            logoText={logoText}
            {...props}
        >
            {children}
        </AuthLayoutTemplate>
    );
}
