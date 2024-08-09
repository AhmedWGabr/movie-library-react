# Movie Library 
"""
Movies Library

This library provides functions and classes for managing a collection of movies. It allows users to add new movies, retrieve information about existing movies, and perform various operations on the movie collection.

Classes:
- Movie: Represents a single movie with attributes such as title, director, and release year.

Functions:
- add_movie(title, director, release_year): Adds a new movie to the library with the given title, director, and release year.
- get_movie(title): Retrieves information about a movie with the given title.
- get_movies(): Retrieves a list of all movies in the library.
- remove_movie(title): Removes a movie with the given title from the library.
- search_movies(keyword): Searches for movies in the library that match the given keyword.

Usage:
1. Create a new movie library object: library = MoviesLibrary()
2. Add new movies to the library: library.add_movie("The Shawshank Redemption", "Frank Darabont", 1994)
3. Retrieve information about a specific movie: movie = library.get_movie("The Shawshank Redemption")
4. Get a list of all movies in the library: movies = library.get_movies()
5. Remove a movie from the library: library.remove_movie("The Shawshank Redemption")
6. Search for movies by keyword: results = library.search_movies("drama")

Note: This library assumes that the movie titles are unique within the collection.
"""
