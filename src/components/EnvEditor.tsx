
// Fix the code where TS1345 error occurs - expression of type 'void' cannot be tested for truthiness
const loadVariables = async () => {
  setIsLoading(true);
  try {
    const loadedVars = await mysqlConnection.loadEnvironmentVariables();
    if (loadedVars) { // Check if loadedVars exists instead of testing void
      setVariables(loadedVars);
    }
    toast({
      title: "Variables cargadas",
      description: "Variables de entorno cargadas correctamente"
    });
  } catch (error) {
    console.error("Error loading environment variables:", error);
    toast({
      variant: "destructive",
      title: "Error",
      description: "Error al cargar variables de entorno"
    });
  } finally {
    setIsLoading(false);
  }
};
