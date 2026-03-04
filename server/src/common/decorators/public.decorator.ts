import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_URL_KEY = 'isPublicUrl';

export const PublicUrl = () => SetMetadata(IS_PUBLIC_URL_KEY, true);
