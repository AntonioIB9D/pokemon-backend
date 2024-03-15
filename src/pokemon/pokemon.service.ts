import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { Model, isValidObjectId } from 'mongoose';
import { PaginationDto } from 'src/common/dto/paginacion.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PokemonService {
  private _defaultLimit: number;
  constructor(
    @InjectModel(Pokemon.name) private readonly _pokemonModel: Model<Pokemon>,
    private readonly _configService: ConfigService,
  ) {
    this._defaultLimit = this._configService.get<number>('defaultLimit');
  }

  /**
   * The function creates a new Pokemon by converting its name to lowercase and handling any potential
   * errors.
   * @param {CreatePokemonDto} createPokemonDTO - The `createPokemonDTO` parameter in the `create`
   * function is an object of type `CreatePokemonDto` that contains information about a new Pokemon to
   * be created. It likely includes properties such as `name`, `type`, `abilities`, `stats`, etc.
   * @returns The `create` function is returning the created `pokemon` object if the creation is
   * successful. If an error occurs during the creation process, it will either throw a
   * `BadRequestException` with a message indicating that the Pokemon already exists in the database, or
   * it will throw an `InternalServerErrorException` with a generic error message.
   */
  async create(createPokemonDTO: CreatePokemonDto) {
    createPokemonDTO.name = createPokemonDTO.name.toLocaleLowerCase();
    try {
      const pokemon = await this._pokemonModel.create(createPokemonDTO);
      return pokemon;
    } catch (error) {
      if (error.code === 11000)
        throw new BadRequestException(
          `Pokemon exists in DB ${JSON.stringify(error.keyValue)}`,
        );
      console.log(error);
      throw new InternalServerErrorException(
        `Can't create Pokemon - Check server logs`,
      );
    }
  }

  findAll({ limit = this._defaultLimit, offset = 0 }: PaginationDto) {
    return this._pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({
        number: 1,
      })
      .select('-__v');
  }

  /**
   * This TypeScript function searches for a Pokemon by ID, name, or number and returns it if found,
   * otherwise throws a NotFoundException.
   * @param {string} term - The `findOne` function you provided is an asynchronous function that
   * searches for a Pokemon based on the `term` provided. The `term` parameter is a string that
   * represents either the name, number, or ID of the Pokemon being searched for.
   * @returns The `findOne` method returns a Pokemon object based on the provided term. It first checks
   * if the term is a number, and if so, it tries to find a Pokemon by its number. If the term is a
   * valid ObjectId, it then tries to find a Pokemon by its ID. If the term is a string, it searches for
   * a Pokemon by its name (case-insensitive). If no
   */
  async findOne(term: string) {
    let pokemon = Pokemon;
    if (!isNaN(Number(term)))
      pokemon = await this._pokemonModel.findOne({ number: term });

    if (pokemon && isValidObjectId(term)) {
      pokemon = await this._pokemonModel.findById(term);
      return pokemon;
    }

    if (pokemon)
      pokemon = await this._pokemonModel.findOne({
        name: term.toLocaleLowerCase().trim(),
      });

    if (!pokemon)
      throw new NotFoundException(
        `Pokemon with id, name or number "${term}" not found`,
      );

    return pokemon;
  }

  /**
   * The function updates a Pokemon record by its ID if the ID is valid, otherwise it throws a
   * NotFoundException.
   * @param {number} id - The `id` parameter is a number representing the unique identifier of a
   * Pokemon in the database.
   * @param {UpdatePokemonDto} updatePokemonDto - The `updatePokemonDto` parameter likely represents
   * the data that will be used to update a Pokemon entity in your application. It could contain fields
   * such as the Pokemon's name, type, abilities, or any other attributes that can be modified.
   * @returns The `update` method is returning the updated Pokemon document with the specified `id`
   * after updating it with the data provided in the `updatePokemonDto`. If the `id` is a valid
   * ObjectId, the method uses `findByIdAndUpdate` to update the document and returns the updated
   * document with the option `{ new: true }` which ensures that the updated document is returned. If
   * the `id`
   */
  async update(id: number, updatePokemonDto: UpdatePokemonDto) {
    if (isValidObjectId(id)) {
      return await this._pokemonModel.findByIdAndUpdate(id, updatePokemonDto, {
        new: true,
      });
    } else {
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
  }

  /**
   * The function removes a Pokemon from the database by its ID and throws an exception if the Pokemon
   * is not found.
   * @param {number} id - The `id` parameter in the `remove` function is a number that represents the
   * unique identifier of the Pokemon that needs to be removed from the database.
   * @returns The `remove` method is returning nothing (`undefined`).
   */
  async remove(id: number) {
    const { deletedCount } = await this._pokemonModel.deleteOne({
      _id: id,
    });
    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    return;
  }
}
