import {Link} from 'react-router-dom';import {EmptyState} from '../components/ui';
export const NotFound=()=><EmptyState title="Page not found" text="The page you're looking for doesn't exist." cta={<Link to="/" className="btn btn-solid">Back to home</Link>}/>;
