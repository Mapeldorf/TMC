import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UsersRepository } from '../repositories/users.repository';
import { User } from '../interfaces/user.interface';
import { GetUsersUseCase } from './get-users.use-case';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let repositorySpy: jasmine.SpyObj<UsersRepository>;

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Rafael Torre',
      username: 'jdoe',
      email: 'rafa@example.com',
      phone: '1234567890',
      website: 'rafa.com',
      address: {
        street: 'c/ Mayor',
        suite: '1',
        city: 'Madrid',
        zipcode: '12345',
        geo: { lat: '0.0', lng: '0.0' },
      },
      company: {
        name: 'TMC',
        catchPhrase: '!Siempre fuertes!',
        bs: 'tecnología',
      },
    },
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('UsersRepository', ['fetch']);
    TestBed.configureTestingModule({
      providers: [GetUsersUseCase, { provide: UsersRepository, useValue: spy }],
    });
    useCase = TestBed.inject(GetUsersUseCase);
    repositorySpy = TestBed.inject(
      UsersRepository,
    ) as jasmine.SpyObj<UsersRepository>;
  });

  it('should emit loading true initially', (done) => {
    repositorySpy.fetch.and.returnValue(of(mockUsers));
    const emitted: any[] = [];
    useCase.execute().subscribe({
      next: (value) => emitted.push(value),
      complete: () => {
        expect(emitted[0]).toEqual({
          items: [],
          loading: true,
          error: false,
          total: 0,
        });
        done();
      },
    });
  });

  it('should emit users on successful fetch', (done) => {
    repositorySpy.fetch.and.returnValue(of(mockUsers));
    const emitted: any[] = [];
    useCase.execute().subscribe({
      next: (value) => emitted.push(value),
      complete: () => {
        expect(emitted[1]).toEqual({
          items: mockUsers,
          loading: false,
          error: false,
          total: 10,
        });
        done();
      },
    });
  });

  it('should emit error on failed fetch', (done) => {
    repositorySpy.fetch.and.returnValue(
      throwError(() => new Error('Fetch failed')),
    );

    const emitted: any[] = [];
    useCase.execute().subscribe({
      next: (value) => emitted.push(value),
      complete: () => {
        expect(emitted[1]).toEqual({
          items: [],
          loading: false,
          error: true,
          total: 0,
        });
        done();
      },
    });
  });
});
