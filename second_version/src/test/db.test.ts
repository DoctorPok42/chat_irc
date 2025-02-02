import mongoose from 'mongoose';
import connectDB from '../db';

jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

describe('connectDB', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let processExitSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.MONGO_URI = 'fake-uri';

    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: number | string | null | undefined ) => {
      throw new Error(`process.exit: ${code}`);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait se connecter à MongoDB et afficher "MongoDB connected" en cas de succès', async () => {
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(true);

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('fake-uri');
    expect(consoleLogSpy).toHaveBeenCalledWith('MongoDB connected');
  });

  it('devrait afficher l\'erreur et appeler process.exit(1) en cas d\'échec de connexion', async () => {
    const error = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(error);

    await expect(connectDB()).rejects.toThrow('process.exit: 1');
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
    expect(processExitSpy).toHaveBeenCalledWith(1);
  });
});
