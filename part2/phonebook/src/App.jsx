import { useState, useEffect } from 'react'
import personService from './services/persons'



const Filter = ({ filter, handleFilterChange }) => (
  <div>
    filter shown with <input value={filter} onChange={handleFilterChange} />
  </div>
)

const PersonForm = ({ addPerson, newName, handleNameChange, newNumber, handleNumberChange }) => (
  <form onSubmit={addPerson}>
    <div>name: <input value={newName} onChange={handleNameChange} /></div>
    <div>number: <input value={newNumber} onChange={handleNumberChange} /></div>
    <button type="submit">add</button>
  </form>
)

const Person = ({ person, deletePerson }) => (
  <p>
    {person.name} {person.number} 
    <button onClick={() => deletePerson(person.id, person.name)}>delete</button>
  </p>
)

const Persons = ({ persons, deletePerson }) => (
  <div>
    {persons.map(person =>
      <Person key={person.id} person={person} deletePerson={deletePerson} />
    )}
  </div>
)



const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')

  // Pobieranie danych z serwera przy starcie
  useEffect(() => {
    personService.getAll().then(initialPersons => {
      setPersons(initialPersons)
    })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    
    // Sprawdza czy jest już osoba o takim imieniu
    const existingPerson = persons.find(p => p.name.toLowerCase() === newName.toLowerCase())

    if (existingPerson) {
      const confirmUpdate = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (confirmUpdate) {
        const changedPerson = { ...existingPerson, number: newNumber }
        
        // AKTUALIZACJA: Zmienia dane na serwerze i podmienia obiekt w tablicy stanu
        personService
          .update(existingPerson.id, changedPerson)
          .then(returnedPerson => {
            setPersons(persons.map(p => p.id !== existingPerson.id ? p : returnedPerson))
            setNewName('')
            setNewNumber('')
          })
          .catch(error => {
            // OBSŁUGA BŁĘDU: Gdy osoba została usunięta w innym oknie
            alert(`Information of '${existingPerson.name}' has already been removed from server`)
            setPersons(persons.filter(p => p.id !== existingPerson.id))
          })
      }
      return
    }

    const personObject = { name: newName, number: newNumber }

    // DODAWANIE: Wysyła nową osobę do bazy i dodaje ją do stanu
    personService.create(personObject).then(returnedPerson => {
      setPersons(persons.concat(returnedPerson))
      setNewName('')
      setNewNumber('')
    })
  }

  // USUWANIE: Usuwa z serwera i odfiltrowuje id ze stanu
  const deletePerson = (id, name) => {
    if (window.confirm(`Delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
        })
    }
  }

  // FILTROWANIE: Tworzy listę osób do pokazania na podstawie wpisanej frazy
  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Filter filter={filter} handleFilterChange={(e) => setFilter(e.target.value)} />
      
      <h3>Add a new</h3>
      <PersonForm
        addPerson={addPerson}
        newName={newName}
        handleNameChange={(e) => setNewName(e.target.value)}
        newNumber={newNumber}
        handleNumberChange={(e) => setNewNumber(e.target.value)}
      />

      <h3>Numbers</h3>
      <Persons persons={personsToShow} deletePerson={deletePerson} />
    </div>
  )
}

export default App