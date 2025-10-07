import { PUBLIC_BAF_URL, PUBLIC_DB_URL } from '$env/static/public';
const baf_url = PUBLIC_BAF_URL || 'http://localhost:3000';
const db_url = PUBLIC_DB_URL || 'http://localhost:4000';

export { baf_url, db_url };
