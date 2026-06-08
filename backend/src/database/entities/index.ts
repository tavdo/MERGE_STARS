import { User } from './user.entity';
import { CoinApplication } from './coin-application.entity';
import { Order } from './order.entity';
import { MetalPrice } from './metal-price.entity';
import { RefreshToken } from './refresh-token.entity';
import { ContactMessage } from './contact-message.entity';
import { Referral } from './referral.entity';
import { EmailVerificationCode } from './email-verification-code.entity';
import { PasswordResetToken } from './password-reset-token.entity';
import { Notification } from './notification.entity';
import { KycDocument } from './kyc-document.entity';

export const entities = [
  User,
  CoinApplication,
  Order,
  MetalPrice,
  RefreshToken,
  ContactMessage,
  Referral,
  EmailVerificationCode,
  PasswordResetToken,
  Notification,
  KycDocument,
];

export {
  User,
  CoinApplication,
  Order,
  MetalPrice,
  RefreshToken,
  ContactMessage,
  Referral,
  EmailVerificationCode,
  PasswordResetToken,
  Notification,
  KycDocument,
};
