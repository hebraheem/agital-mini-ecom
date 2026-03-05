import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { NotFoundException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    findById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getAllUsers: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('currentUser', () => {
    it('should return current user', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '123', name: 'Test', email: 'test@test.com' },
      };
      mockUserService.findById.mockResolvedValue(mockResponse);

      const result = await controller.currentUser('123');

      expect(result).toEqual(mockResponse);
      expect(userService.findById).toHaveBeenCalledWith('123');
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '456', name: 'Other User', email: 'other@test.com' },
      };
      mockUserService.findById.mockResolvedValue(mockResponse);

      const result = await controller.findOne('456');

      expect(result).toEqual(mockResponse);
      expect(userService.findById).toHaveBeenCalledWith('456');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserService.findById.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateDto = { name: 'Updated Name' };
      const mockResponse = {
        success: true,
        error: null,
        data: { id: '123', name: 'Updated Name', email: 'test@test.com' },
      };
      mockUserService.updateUser.mockResolvedValue(mockResponse);

      const result = await controller.updateUser(updateDto, '123');

      expect(result).toEqual(mockResponse);
      expect(userService.updateUser).toHaveBeenCalledWith('123', updateDto);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      const mockResponse = { success: true, error: null, data: null };
      mockUserService.deleteUser.mockResolvedValue(mockResponse);

      const result = await controller.deleteUser('123');

      expect(result).toEqual(mockResponse);
      expect(userService.deleteUser).toHaveBeenCalledWith('123');
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const mockResponse = { success: true, error: null, data: null };
      mockUserService.updatePassword.mockResolvedValue(mockResponse);

      const result = await controller.updatePassword('123', { newPassword: 'newPass123' });

      expect(result).toEqual(mockResponse);
      expect(userService.updatePassword).toHaveBeenCalledWith('123', 'newPass123');
    });
  });
});
