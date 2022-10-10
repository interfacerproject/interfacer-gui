export interface IfSidebarTagProps {
    text: string;
}

const IfSidebarTag = (props: IfSidebarTagProps) => {
    return (
        <span className="px-1 py-0.5 text-xs rounded-lg font-display text-primary bg-accent">
            {props.text}
        </span>
    );
};

export default IfSidebarTag;