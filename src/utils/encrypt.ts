import { createCipheriv, randomBytes, createDecipheriv, scrypt } from 'crypto';
import { promisify } from 'util';
import { config } from 'dotenv';
config();

const algorithm = 'aes-256-ctr';
const password = 'S3cret';

export const encryptData = async (data: string) => {
  const iv = randomBytes(16);

  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const cipher = createCipheriv(algorithm, key, iv);

  const encryptedText = Buffer.concat([
    iv,
    cipher.update(data),
    cipher.final(),
  ]);

  return encryptedText.toString('base64');
};

export const decryptData = async (data: string) => {
  let encryptbuf = Buffer.from(data, 'base64');
  const iv = encryptbuf.slice(0, 16);
  encryptbuf = encryptbuf.slice(16);

  const key = (await promisify(scrypt)(password, 'salt', 32)) as Buffer;
  const decipher = createDecipheriv(algorithm, key, iv);
  const decryptedText = Buffer.concat([
    decipher.update(encryptbuf),
    decipher.final(),
  ]);
  return decryptedText.toString();
};
