export default function HeadingSmall({
    title,
    description,
}: {
    title: string;
    description?: string;
}) {
    return (
        <header>
            <h3 
                className="mb-0.5 text-base font-medium"
                style={{ color: 'var(--heading, var(--color-heading, inherit))' }}
            >
                {title}
            </h3>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </header>
    );
}
