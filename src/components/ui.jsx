export const Skeleton=({className=''})=><div className={`skeleton ${className}`} aria-hidden="true"/>;
export const ProductSkeleton=()=><div><Skeleton className="aspect-[3/4]"/><Skeleton className="h-3 w-3/4 mt-3"/><Skeleton className="h-3 w-1/3 mt-2"/></div>;
export const Badge=({children})=><span className="bg-gold text-ink border border-gold px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase">{children}</span>;
export const EmptyState=({title,text,cta})=><div className="text-center py-24"><div className="font-display text-3xl">{title}</div><p className="text-mute mt-2 mb-6">{text}</p>{cta}</div>;
export const ErrorState=({onRetry})=><div className="text-center py-20"><p className="text-red-600/80 mb-4">Something went wrong. Check your connection and try again.</p><button className="btn btn-line" onClick={onRetry}>Retry</button></div>;
