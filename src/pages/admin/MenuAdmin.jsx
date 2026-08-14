import React, { useEffect, useState } from 'react';
import { menuService } from '../../services/menuService';

const MenuAdmin = () => {
  const [menu, setMenu] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados para el formulario (Agregar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Entradas',
    available: true
  });

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const data = await menuService.getMenu();
      setMenu(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      const updated = await menuService.toggleAvailability(id);
      setMenu(prev => prev.map(d => d.id === id ? updated : d));
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este plato?')) {
      try {
        await menuService.deleteDish(id);
        setMenu(prev => prev.filter(d => d.id !== id));
      } catch (error) {
        console.error('Error deleting dish:', error);
      }
    }
  };

  const openModal = (dish = null) => {
    if (dish) {
      setEditingDish(dish);
      setFormData({
        name: dish.name,
        description: dish.description,
        price: dish.price,
        category: dish.category,
        image: dish.image || '',
        available: dish.available
      });
    } else {
      setEditingDish(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Entradas',
        image: '',
        available: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDish) {
        const updated = await menuService.updateDish(editingDish.id, formData);
        setMenu(prev => prev.map(d => d.id === editingDish.id ? updated : d));
      } else {
        const added = await menuService.addDish(formData);
        setMenu(prev => [...prev, added]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving dish:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Gestión del Menú</h1>
          <p className="text-on-surface-variant">Agrega, edita y administra los platos</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nuevo Plato
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menu.map((dish) => (
            <div key={dish.id} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm flex flex-col hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-surface-container-highest">
                {dish.image ? (
                  <img src={dish.image} alt={dish.name} className={`w-full h-full object-cover transition-opacity ${!dish.available && 'opacity-50 grayscale'}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl">restaurant</span>
                  </div>
                )}
                {!dish.available && (
                  <div className="absolute top-3 right-3 bg-error text-on-error px-2 py-1 rounded text-xs font-bold uppercase tracking-wider shadow-sm">
                    Agotado
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-surface/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-on-surface uppercase tracking-wider shadow-sm border border-outline-variant">
                  {dish.category}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className={`font-bold text-lg leading-tight ${!dish.available ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                    {dish.name}
                  </h3>
                  <span className="font-bold text-primary whitespace-nowrap">S/ {Number(dish.price).toFixed(2)}</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {dish.description}
                </p>
                
                <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-outline-variant">
                  <button 
                    onClick={() => handleToggleAvailability(dish.id)}
                    title={dish.available ? "Marcar como Agotado" : "Marcar como Disponible"}
                    className={`p-2 rounded-xl transition-colors ${
                      dish.available 
                        ? 'bg-surface-container hover:bg-warning-container hover:text-on-warning-container text-on-surface-variant' 
                        : 'bg-green-50 hover:bg-green-100 text-green-700'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {dish.available ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                  <button 
                    onClick={() => openModal(dish)}
                    title="Editar"
                    className="p-2 rounded-xl bg-surface-container hover:bg-primary-container hover:text-on-primary-container text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                  <button 
                    onClick={() => handleDelete(dish.id)}
                    title="Eliminar"
                    className="p-2 rounded-xl bg-surface-container hover:bg-error-container hover:text-on-error-container text-on-surface-variant transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para Agregar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface w-full max-w-lg rounded-3xl shadow-xl overflow-hidden border border-outline-variant flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
              <h2 className="text-xl font-bold text-on-surface">
                {editingDish ? 'Editar Plato' : 'Nuevo Plato'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="dish-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Nombre del Plato</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">URL de Imagen</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.image || ''}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Categoría</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                    >
                      <option value="Entradas">Entradas</option>
                      <option value="Fondos">Fondos</option>
                      <option value="Postres">Postres</option>
                      <option value="Bebidas">Bebidas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-on-surface mb-1">Precio (S/)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-on-surface mb-1">Descripción</label>
                  <textarea
                    required
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface resize-none"
                  ></textarea>
                </div>
                
                <div className="flex items-center gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                  <input
                    type="checkbox"
                    id="available-check"
                    checked={formData.available}
                    onChange={(e) => setFormData({...formData, available: e.target.checked})}
                    className="w-5 h-5 text-primary rounded border-outline-variant focus:ring-primary"
                  />
                  <label htmlFor="available-check" className="text-sm font-medium text-on-surface cursor-pointer select-none">
                    Plato disponible en el menú
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-outline-variant bg-surface-container-lowest flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl border border-outline-variant text-on-surface hover:bg-surface-container font-medium transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="dish-form"
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-medium hover:bg-primary/90 transition-colors shadow-sm"
              >
                {editingDish ? 'Guardar Cambios' : 'Crear Plato'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuAdmin;
