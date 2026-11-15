package br.com.jadespa.admin.service;

import br.com.jadespa.admin.model.Plano;
import br.com.jadespa.admin.repository.PlanoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class PlanoService {

    private final PlanoRepository planoRepository;

    public PlanoService(PlanoRepository planoRepository) {
        this.planoRepository = planoRepository;
    }

    public List<Plano> listarPlanosAtivos() {
        return planoRepository.findByAtivoTrueOrderByValorAsc();
    }

    public Plano buscarPlano(Long id) {
        return planoRepository.findById(id)
                .filter(plano -> Boolean.TRUE.equals(plano.getAtivo()))
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Plano não encontrado."
                ));
    }
}