import { MuseumRecord } from '../../modules/museum-v78/museum-record.entity';
import { ProductPassport } from './product-passport.entity';
import { CoinConfiguratorProduct } from './coin-configurator-product.entity';
import { CoinConfiguratorSession } from './coin-configurator-session.entity';
import { CoinPackageConfig } from './coin-package-config.entity';
import { AiTrainingItem } from './ai-training-item.entity';
import { BrandRoomPick } from './brand-room-pick.entity';
import {
  FitProfile,
  DesignProposal,
  ProductInteraction,
} from '../../modules/experience/experience.entity';
import {
  MaterialLabEvent,
  MaterialLabFile,
} from '../../modules/material-lab/material-lab.entity';
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
import { CatalogCollection } from './catalog-collection.entity';
import { CatalogItem } from './catalog-item.entity';
import { BrandLineProfile } from './brand-line-profile.entity';
import { PlatformSettings } from './platform-settings.entity';
import { PhoneVerificationCode } from './phone-verification-code.entity';
import { WalletTransaction } from './wallet-transaction.entity';
import { CatalogOrder } from './catalog-order.entity';

export const entities = [
  MuseumRecord,
  BrandRoomPick,
  AiTrainingItem,
  CoinPackageConfig,
  CoinConfiguratorSession,
  CoinConfiguratorProduct,
  ProductPassport,
  FitProfile,
  DesignProposal,
  ProductInteraction,
  MaterialLabEvent,
  MaterialLabFile,
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
  CatalogCollection,
  CatalogItem,
  BrandLineProfile,
  PlatformSettings,
  PhoneVerificationCode,
  WalletTransaction,
  CatalogOrder,
];

export {
  MuseumRecord,
  BrandRoomPick,
  AiTrainingItem,
  CoinPackageConfig,
  CoinConfiguratorSession,
  CoinConfiguratorProduct,
  ProductPassport,
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
  CatalogCollection,
  CatalogItem,
  BrandLineProfile,
  PlatformSettings,
  PhoneVerificationCode,
  WalletTransaction,
  CatalogOrder,
};
