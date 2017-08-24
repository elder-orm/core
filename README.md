# Elder

An ORM for javascript and typescript

[![npm version](https://badge.fury.io/js/elder-core.svg)](https://badge.fury.io/js/elder-core)
[![Build Status](https://travis-ci.org/elder-orm/core.svg?branch=master)](https://travis-ci.org/elder-orm/core)
[![Greenkeeper badge](https://badges.greenkeeper.io/elder-orm/core.svg)](https://greenkeeper.io/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Code Climate](https://codeclimate.com/github/elder-orm/core.png)](https://codeclimate.com/github/elder-orm/core)

## Quickstart

### Install

Inside your project, run one of the following commands to install Elder
- via Yarn: `yarn add elder-core`
- or via npm: `npm install elder-core`

### Setup

While you could write all your ORM code in a single file if you wanted, we recommend breaking up your code in the
following way.

#### Folder structure

We recommend creating the following directory structure when using Elder. This is in part because
once a cli tool is developed, it will most likely follow the conventions laid out in this guide.

```
/my-project
  /orm
    /models
    /types
    config.ts
    index.ts
```

#### The models folder

The `orm/models` directory is where you should put your model files. Models are the most important part of Elder and
each model represents a table in a database. When naming your files we recommend 1 file per database table named in
singular form, lower case and with dashes used to separate any words.

Examples
- `models/post.ts`
- `models/post-comment.ts`

#### The types folder

Types are a way to tell the elder how to map you model's properties to columns in the database. Elder comes with some
base types which can be used directly or as a starting point for building more complex types.

The types Elder ships with are:
- `string`
- `boolean`
- `date`
- `number`

Types are very flexible and can include validations. You are encouraged to build various types to meet your applications
needs. See the documentation on types for more information.

Types should be placed in separate files inside the `/types` folder. Naming should follow a singularized, lowercase,
dash separated convention.

Examples:
- `/types/age.ts`
- `/types/cat-age.ts`

#### The config file

The config file is used, among other things, to store details about the database connection.
For now we just need to create the file `/orm/config.ts` and populate it with the following
information. (Changing values as appropriate).

Example
```js
export default {
  adapters: {
    default: {
      host: '127.0.0.1',
      user: 'user',
      pass: 'sshhh',
      port: 5432
    }
  }
}
```

The property `adapters` with a nested property `default` tells Elder to use these
connection details whenever the default database adapter is used. It's possible
to define additional adapters, more about that in the adapters section.

#### The index file

In the index file we need to tie everything we have laid out so far together.

First we import the `Elder` module from `elder-core`, then our config file.

Next we import each type we have defined in our type folder (none so far, we'll get to that)
and each model file we have defined in our model folder. (Coming up in the next section).

Finally, we create and export a new instance of `Elder` passing it all the things we
have imported.

Example:
```js
import Elder from 'elder-core'
import config from './config'

/*
  import CatAgeType from './types/cat-age'
  import DogSizeType from './types/doge-size'
*/

/*
  import Cat from './models/cat'
  import Dog from './models/dog'
  etc
*/

export default Elder.create({
  config,
  types: {
    /*
      give any custom types we have defined and imported here:
      'cat-age': CatAgeType,
      'dog-size': DogSizeType
    */
  },
  models: {
    /*
      give any models we have defined and imported here:
      'cat': Cat,
      'dog': Dog
    */
  }
})
```

Worth noting also is that there are several other concepts working behind the scenes.
Both `adapters` and `serializers` are always present but Elder will give you the
defaults if you omit them from setup. You can read more about these 2 concepts
in their respective sections of the guide.

### Defining models

With project structure in hand we can now start creating models to use to interface
with our database.

Each model should be in it's own file in the `orm/models` directory. If we were
to create a `Cat` model, the file should be `orm/models/cat.ts`.

Model files should export a single model and extend either the base `Model` class
or another model class.

Example
```js
import { Model } from 'elder-core'

export default Cat extends Model {}
```

We define mappings between properties on our model and columns in the database using
the `@type` decorator. For now, we will just use the built in basic types
`string`, `number`, `date` and `boolean` as we haven't yet defined any application
specific types (which we will do in the next section)

Example
```js
import { Model, type } from 'elder-core'

export default Cat extends Model {
  @type('string') name
}
```

We have told Elder that our cat has a corresponding `name` column in the `cat`
table and that it is string based (which in the case of postgres is varchar).

### Defining types

When defining models we saw that we need to map model properties to database table
columns and to do that we use the `@type` decorator. One of the key features of
Elder is that is possible and even encouraged to develop different mappings to
suit your needs. This is great because you can easily add support for database
specific features eg. geospatial and you can add validations to ensure data
integrity.

The best way to define a type is to extend an existing type. We can choose the type
the most closely resembles our needs, override whichever methods make sense and
go from there.

By convention, type classes should be placed in the `orm/types` folder and be named
singularly, lowercase with dashes instead of spaces.

Heres an example of creating a type that represents the age of a
cat. It adds validation to make sure the value is between 0 and 30 (Or can cats
get older than that??)

Example
```js
// orm/types/cat-age.ts
import { NumberType } from 'elder-core'

export default CatAgeType extends NumberType {
  validate (value: number): boolean {
    return value >= 0 && value <= 30
  }
}
```

And now back in our model file, we can reference this new type using our `@type`
decorator like so:

Example
```js
// orm/models/cat.ts
export default Cat extends Model {
  @type('string') name
  @type('cat-age') age
}
```

Finally we need to go back to our `orm/index.ts` file and load in our `cat` model
and `cat-age` type.

Example
Example:
```js
import Elder from 'elder-core'
import config from './config'

import CatAgeType from './types/cat-age'
import Cat from './models/cat'

export default Elder.create({
  config,
  types: {
    'cat-age': CatAgeType
  },
  models: {
    cat: Cat
  }
})
```

### Basic Usage

We should now have an Elder ORM setup and ready for use. For the purposes of
demonstration, we can create an `index.ts` file at the root of our project where
we can import our ORM and start using it.

Create `index.ts` in the project root so that your project looks like the following

Example
```
/my-project
  /orm
    /models
    /types
    config.ts
    index.ts
  index.ts <-- add this file
```

Inside `index.ts` we should now be able to import our ORM and start using it's API.

Example
```js
// my-project/index.ts
import orm from './orm'
const Cat = orm.models.cat

/* Cat.all().then(...) */
```
